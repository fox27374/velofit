import 'dart:typed_data';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import '../angle_utils.dart';
import '../widgets/camera_fill.dart';

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
  CameraDescription? _camera;
  bool _cameraReady = false;
  int _cyclesDetected = 0;
  final List<double> _ankleYValues = [];
  final List<double> _ankleXValues = [];

  /// A peak is only confirmed [_peakWindow] frames after it happened, so the
  /// pose at the bottom of the stroke has to be kept until then.
  static const int _peakWindow = 3;
  final List<List<PoseLandmark>> _recentPoses = [];

  int _posesSeen = 0;

  // Buffers for averaging angles across bottom-of-stroke cycles
  final List<List<PoseLandmark>> _cycleBottomPoses = [];
  static const int _maxCycleBuffer = 8;

  // For pedal-forward JPEG and its pose detection
  String? _pedalForwardImagePath;
  PoseLandmark? _pedalForwardKneeLandmark;

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

    _camera = cameras[0];
    _cameraController = CameraController(
      cameras[0],
      ResolutionPreset.high,
      enableAudio: false,
      // Without this the stream is 3-plane YUV_420_888 and the NV21 buffer
      // handed to ML Kit below is two thirds short, so nothing is ever
      // detected. CameraX still reports the format as yuv420 either way.
      imageFormatGroup: ImageFormatGroup.nv21,
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

      _posesSeen++;
      if (_frameCount % 30 == 0) {
        debugPrint('[velofit] frames=$_frameCount poses=$_posesSeen '
            'samples=${_ankleYValues.length} cycles=$_cyclesDetected');
      }

      if (ankle != null && mounted) {
        final a = ankle;
        setState(() {
          _ankleYValues.add(a.y);
          _ankleXValues.add(a.x);
          _recentPoses.add(landmarksList);
          if (_recentPoses.length > _peakWindow + 1) {
            _recentPoses.removeAt(0);
          }
          _updateCycleCount();
        });
      }
    } catch (e) {
      debugPrint('Pose detection error: $e');
    }
  }

  InputImage? _createInputImage(CameraImage image) {
    try {
      final camera = _camera;
      if (camera == null) return null;

      final builder = BytesBuilder(copy: false);
      for (final plane in image.planes) {
        builder.add(plane.bytes);
      }

      return InputImage.fromBytes(
        bytes: builder.takeBytes(),
        metadata: InputImageMetadata(
          size: Size(image.width.toDouble(), image.height.toDouble()),
          rotation: _inputImageRotation(camera),
          format: InputImageFormat.nv21,
          bytesPerRow: image.planes[0].bytesPerRow,
        ),
      );
    } catch (e) {
      debugPrint('InputImage creation error: $e');
      return null;
    }
  }

  static const Map<DeviceOrientation, int> _orientationDegrees = {
    DeviceOrientation.portraitUp: 0,
    DeviceOrientation.landscapeLeft: 90,
    DeviceOrientation.portraitDown: 180,
    DeviceOrientation.landscapeRight: 270,
  };

  /// The rotation that brings the sensor buffer upright. Hardcoding 0 here
  /// hands ML Kit a sideways rider, and "down" stops being +y, which the
  /// bottom-of-stroke detection depends on.
  InputImageRotation _inputImageRotation(CameraDescription camera) {
    final compensation =
        _orientationDegrees[_cameraController.value.deviceOrientation] ?? 0;
    final degrees = camera.lensDirection == CameraLensDirection.front
        ? (camera.sensorOrientation + compensation) % 360
        : (camera.sensorOrientation - compensation + 360) % 360;

    switch (degrees) {
      case 90:
        return InputImageRotation.rotation90deg;
      case 180:
        return InputImageRotation.rotation180deg;
      case 270:
        return InputImageRotation.rotation270deg;
      default:
        return InputImageRotation.rotation0deg;
    }
  }

  void _updateCycleCount() {
    if (_ankleYValues.length < 15) return;
    if (_recentPoses.length < _peakWindow + 1) return;

    // Check for y-peak (bottom-of-stroke). isPeak needs _peakWindow samples on
    // BOTH sides, so the newest index it can ever confirm is _peakWindow back
    // from the end — passing the last index made it return false every time.
    final yPeakIndex = _ankleYValues.length - 1 - _peakWindow;
    if (isPeak(_ankleYValues, yPeakIndex, _peakWindow)) {
      if (_ankleXValues.length >= 10) {
        final xPeakWindow = 3;
        for (int i = _ankleXValues.length - 10; i < _ankleXValues.length; i++) {
          if (i >= 0 && i < _ankleXValues.length && isPeak(_ankleXValues, i, xPeakWindow)) {
            // The pose from the peak frame, not the current one _peakWindow
            // frames later — 200ms off at 15fps skews every angle.
            _cycleBottomPoses.add(_recentPoses.first);
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
        });
      }
    } catch (e) {
      debugPrint('Pedal-forward frame capture error: $e');
    }
  }

  /// Compute averaged angles across all captured bottom-of-stroke cycles.
  Map<String, double> _computeAveragedAngles() {
    double totalKneeFlexion = 0;
    double totalHipAngle = 0;
    double totalTorsoAngle = 0;
    double totalElbowAngle = 0;

    // Counted per metric, not per cycle: a cycle where the detector missed the
    // elbow must not drag the elbow average toward zero while still counting
    // in its denominator.
    int kneeCount = 0;
    int hipCount = 0;
    int torsoCount = 0;
    int elbowCount = 0;

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
        kneeCount++;
      }

      if (shoulder != null && hip != null && knee != null) {
        totalHipAngle += hipAngle(
          (x: shoulder.x, y: shoulder.y),
          (x: hip.x, y: hip.y),
          (x: knee.x, y: knee.y),
        );
        hipCount++;
      }

      if (shoulder != null && hip != null) {
        totalTorsoAngle += torsoAngle(
          (x: shoulder.x, y: shoulder.y),
          (x: hip.x, y: hip.y),
        );
        torsoCount++;
      }

      if (shoulder != null && elbow != null && wrist != null) {
        totalElbowAngle += elbowAngle(
          (x: shoulder.x, y: shoulder.y),
          (x: elbow.x, y: elbow.y),
          (x: wrist.x, y: wrist.y),
        );
        elbowCount++;
      }
    }

    double average(double total, int count) =>
        count == 0 ? unavailableMeasurement : total / count;

    return {
      'kneeFlexion': average(totalKneeFlexion, kneeCount),
      'hipAngle': average(totalHipAngle, hipCount),
      'torsoAngle': average(totalTorsoAngle, torsoCount),
      'elbowAngle': average(totalElbowAngle, elbowCount),
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
                Positioned.fill(child: FillPreview(_cameraController)),
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
