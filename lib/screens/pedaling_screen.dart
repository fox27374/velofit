import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import '../angle_utils.dart';

class PedalingScreen extends StatefulWidget {
  final double wheelDiameter;
  final double pixelScale;
  final String calibrationImage;
  final Offset bbPoint;
  final Offset saddlePoint;

  const PedalingScreen({
    super.key,
    required this.wheelDiameter,
    required this.pixelScale,
    required this.calibrationImage,
    required this.bbPoint,
    required this.saddlePoint,
  });

  @override
  State<PedalingScreen> createState() => _PedalingScreenState();
}

class _PedalingScreenState extends State<PedalingScreen> {
  late CameraController _cameraController;
  late PoseDetector _poseDetector;
  bool _cameraReady = false;
  int _cyclesDetected = 0;
  final List<double> _ankleYValues = [];
  final List<double> _ankleXValues = [];

  // Buffers for averaging angles across bottom-of-stroke cycles
  final List<List<PoseLandmark>> _cycleBottomPoses = [];
  static const int _maxCycleBuffer = 8;

  // For pedal-forward JPEG and its pose detection
  String? _pedalForwardImagePath;
  PoseLandmark? _pedalForwardKneeLandmark;
  Size? _pedalForwardImageSize;

  bool _processingFrame = false;
  int _frameCount = 0;
  bool _capturingFrame = false;

  @override
  void initState() {
    super.initState();
    final options = PoseDetectorOptions();
    _poseDetector = PoseDetector(options: options);
    _initCamera();
  }

  Future<void> _initCamera() async {
    final cameras = await availableCameras();
    if (cameras.isEmpty) return;

    _cameraController = CameraController(
      cameras[0],
      ResolutionPreset.high,
      enableAudio: false,
    );

    try {
      await _cameraController.initialize();
      if (mounted) setState(() => _cameraReady = true);
      _startPoseStream();
    } catch (e) {
      debugPrint('Camera init error: $e');
    }
  }

  void _startPoseStream() {
    _cameraController.startImageStream((CameraImage image) {
      if (_processingFrame || !mounted) return;

      _frameCount++;
      if (_frameCount % 2 != 0) return; // Process every 2nd frame (~15fps)

      _processingFrame = true;

      _detectPose(image).then((_) {
        _processingFrame = false;
      });
    });
  }

  Future<void> _detectPose(CameraImage image) async {
    try {
      // Convert camera image to InputImage for pose detection
      final inputImage = _createInputImage(image);
      if (inputImage == null) return;

      final poses = await _poseDetector.processImage(inputImage);
      if (poses.isEmpty) return;

      final pose = poses[0];
      final landmarksList = pose.landmarks.values.toList();

      // Extract ankle landmarks - handle both left and right
      PoseLandmark? ankle;
      for (final landmark in landmarksList) {
        if (landmark.type == PoseLandmarkType.leftAnkle ||
            landmark.type == PoseLandmarkType.rightAnkle) {
          ankle = landmark;
          break;
        }
      }

      if (ankle != null && mounted) {
        final a = ankle;
        setState(() {
          _ankleYValues.add(a.y);
          _ankleXValues.add(a.x);
          _updateCycleCount(landmarksList);
        });
      }
    } catch (e) {
      debugPrint('Pose detection error: $e');
    }
  }

  InputImage? _createInputImage(CameraImage image) {
    try {
      final plane = image.planes[0];
      final bytes = Uint8List.fromList(plane.bytes);
      final width = image.width;
      final height = image.height;

      return InputImage.fromBytes(
        bytes: bytes,
        metadata: InputImageMetadata(
          size: Size(width.toDouble(), height.toDouble()),
          rotation: InputImageRotation.rotation0deg,
          format: InputImageFormat.nv21,
          bytesPerRow: image.planes[0].bytesPerRow,
        ),
      );
    } catch (e) {
      debugPrint('InputImage creation error: $e');
      return null;
    }
  }

  void _updateCycleCount(List<PoseLandmark> currentPose) {
    if (_ankleYValues.length < 15) return;

    // Check for y-peak (bottom-of-stroke)
    final yPeakWindow = 3;
    if (isPeak(_ankleYValues, _ankleYValues.length - 1, yPeakWindow)) {
      if (_ankleXValues.length >= 10) {
        final xPeakWindow = 3;
        for (int i = _ankleXValues.length - 10; i < _ankleXValues.length; i++) {
          if (i >= 0 && i < _ankleXValues.length && isPeak(_ankleXValues, i, xPeakWindow)) {
            // Capture this cycle's pose at the bottom-of-stroke instant
            _cycleBottomPoses.add(currentPose);
            if (_cycleBottomPoses.length > _maxCycleBuffer) {
              _cycleBottomPoses.removeAt(0);
            }

            _cyclesDetected++;
            if (_cyclesDetected == 5 && !_capturingFrame) {
              _capturingFrame = true;
              _capturePedalForwardFrame();
            }
            break;
          }
        }
      }
    }
  }

  Future<void> _capturePedalForwardFrame() async {
    if (_pedalForwardImagePath != null) return;
    try {
      await _cameraController.stopImageStream();
      final file = await _cameraController.takePicture();

      // Get image dimensions by decoding the JPEG
      final bytes = await file.readAsBytes();
      final codec = await ui.instantiateImageCodec(bytes);
      final frame = await codec.getNextFrame();
      final imageSize = Size(
        frame.image.width.toDouble(),
        frame.image.height.toDouble(),
      );
      frame.image.dispose();

      // Run pose detection on the pedal-forward JPEG
      final inputImage = InputImage.fromFilePath(file.path);
      final poses = await _poseDetector.processImage(inputImage);

      PoseLandmark? kneeLandmark;
      if (poses.isNotEmpty) {
        final pose = poses[0];
        try {
          kneeLandmark = pose.landmarks.values
              .firstWhere((l) => l.type == PoseLandmarkType.leftKnee);
        } catch (e) {
          debugPrint('Knee landmark not found in pedal-forward frame');
        }
      }

      if (mounted) {
        setState(() {
          _pedalForwardImagePath = file.path;
          _pedalForwardKneeLandmark = kneeLandmark;
          _pedalForwardImageSize = imageSize;
        });
      }
    } catch (e) {
      debugPrint('Pedal-forward frame capture error: $e');
    }
  }

  /// Compute averaged angles across all captured bottom-of-stroke cycles.
  Map<String, double> _computeAveragedAngles() {
    if (_cycleBottomPoses.isEmpty) {
      return {
        'kneeFlexion': 0,
        'hipAngle': 0,
        'torsoAngle': 0,
        'elbowAngle': 0,
      };
    }

    double totalKneeFlexion = 0;
    double totalHipAngle = 0;
    double totalTorsoAngle = 0;
    double totalElbowAngle = 0;

    for (final pose in _cycleBottomPoses) {
      final shoulder = _getLandmark(pose, PoseLandmarkType.leftShoulder);
      final hip = _getLandmark(pose, PoseLandmarkType.leftHip);
      final knee = _getLandmark(pose, PoseLandmarkType.leftKnee);
      final ankle = _getLandmark(pose, PoseLandmarkType.leftAnkle);
      final elbow = _getLandmark(pose, PoseLandmarkType.leftElbow);
      final wrist = _getLandmark(pose, PoseLandmarkType.leftWrist);

      if (shoulder != null && hip != null && knee != null && ankle != null) {
        totalKneeFlexion += kneeFlexion(
          (x: hip.x, y: hip.y),
          (x: knee.x, y: knee.y),
          (x: ankle.x, y: ankle.y),
        );
      }

      if (shoulder != null && hip != null && knee != null) {
        totalHipAngle += hipAngle(
          (x: shoulder.x, y: shoulder.y),
          (x: hip.x, y: hip.y),
          (x: knee.x, y: knee.y),
        );
      }

      if (shoulder != null && hip != null) {
        totalTorsoAngle += torsoAngle(
          (x: shoulder.x, y: shoulder.y),
          (x: hip.x, y: hip.y),
        );
      }

      if (shoulder != null && elbow != null && wrist != null) {
        totalElbowAngle += elbowAngle(
          (x: shoulder.x, y: shoulder.y),
          (x: elbow.x, y: elbow.y),
          (x: wrist.x, y: wrist.y),
        );
      }
    }

    final count = _cycleBottomPoses.length.toDouble();
    return {
      'kneeFlexion': totalKneeFlexion / count,
      'hipAngle': totalHipAngle / count,
      'torsoAngle': totalTorsoAngle / count,
      'elbowAngle': totalElbowAngle / count,
    };
  }

  /// Get a landmark from a pose by type.
  PoseLandmark? _getLandmark(
    List<PoseLandmark> pose,
    PoseLandmarkType type,
  ) {
    try {
      return pose.firstWhere((l) => l.type == type);
    } catch (e) {
      return null;
    }
  }

  void _proceed() {
    final averagedAngles = _computeAveragedAngles();
    Navigator.of(context).pushNamed(
      '/bike_point',
      arguments: {
        'wheelDiameter': widget.wheelDiameter,
        'pixelScale': widget.pixelScale,
        'calibrationImage': widget.calibrationImage,
        'pedalForwardImage': _pedalForwardImagePath ?? widget.calibrationImage,
        'bbPoint': widget.bbPoint,
        'saddlePoint': widget.saddlePoint,
        'kneeFlexion': averagedAngles['kneeFlexion'] ?? 0,
        'hipAngle': averagedAngles['hipAngle'] ?? 0,
        'torsoAngle': averagedAngles['torsoAngle'] ?? 0,
        'elbowAngle': averagedAngles['elbowAngle'] ?? 0,
        'pedalForwardKneeLandmark': _pedalForwardKneeLandmark,
        'pedalForwardImageSize': _pedalForwardImageSize,
      },
    );
  }

  @override
  void dispose() {
    _cameraController.dispose();
    _poseDetector.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pedaling Capture')),
      body: _cameraReady
          ? Stack(
              children: [
                CameraPreview(_cameraController),
                Positioned(
                  top: 16,
                  left: 16,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.black87,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Cycles detected: $_cyclesDetected',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 16,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: ElevatedButton(
                      onPressed: _cyclesDetected >= 5 ? _proceed : null,
                      child: Text(_cyclesDetected >= 5
                          ? 'Done ($_cyclesDetected cycles)'
                          : 'Capture at least 5 cycles'),
                    ),
                  ),
                ),
              ],
            )
          : const Center(child: Text('Initializing camera...')),
    );
  }
}
