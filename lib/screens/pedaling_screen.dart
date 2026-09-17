import 'dart:io';
import 'dart:typed_data';
import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'package:image/image.dart' as img;
import '../angle_utils.dart';
import '../capture_gate.dart';
import '../widgets/camera_fill.dart';

class PedalingScreen extends StatefulWidget {
  final double wheelDiameter;
  final double pixelScale;
  final String calibrationImage;
  final double calibrationPhotoWidth;
  final double calibrationPhotoHeight;
  final List<Offset> calibrationTaps;
  final Offset bbPoint;
  final Offset saddlePoint;

  const PedalingScreen({
    super.key,
    required this.wheelDiameter,
    required this.pixelScale,
    required this.calibrationImage,
    required this.calibrationPhotoWidth,
    required this.calibrationPhotoHeight,
    required this.calibrationTaps,
    required this.bbPoint,
    required this.saddlePoint,
  });

  @override
  State<PedalingScreen> createState() => _PedalingScreenState();
}

/// Single captured frame: NV21 bytes, dimensions, and pose landmarks.
class _FrameData {
  final Uint8List nv21Bytes;
  final int width;
  final int height;
  final List<PoseLandmark> landmarks;

  /// Same clock the gate stamps its samples with, so a keep request can name
  /// exactly one buffered frame.
  final int timestampMs;

  _FrameData({
    required this.nv21Bytes,
    required this.width,
    required this.height,
    required this.landmarks,
    required this.timestampMs,
  });
}

/// A kept pedal-forward frame with its knee landmark and knee-x value.
class _PedalForwardFrame {
  final String path; // Path to the encoded JPEG
  final PoseLandmark kneeLandmark;
  final double kneeX; // In calibration photo pixels
  final int streamImageWidth;
  final int streamImageHeight;

  _PedalForwardFrame({
    required this.path,
    required this.kneeLandmark,
    required this.kneeX,
    required this.streamImageWidth,
    required this.streamImageHeight,
  });
}

class _PedalingScreenState extends State<PedalingScreen> {
  late CameraController _cameraController;
  late PoseDetector _poseDetector;
  CameraDescription? _camera;
  bool _cameraReady = false;

  // Rolling buffer of the last 8 processed frames (for pedal-forward capture)
  final List<_FrameData> _frameBuffer = [];
  static const int _frameBufferSize = 8;

  // Buffers for angle computation (from bottom-of-stroke cycles)
  final List<List<PoseLandmark>> _cycleBottomPoses = [];
  static const int _maxCycleBuffer = 8;

  // The state machine
  late CaptureGate _gate;

  // Map from gate sample index to frame buffer index for keeping frames
  final Map<int, _FrameData> _keptSampleFrames = {};
  final List<_PedalForwardFrame> _keptFrames = [];

  // Timing
  late Stopwatch _stopwatch;
  static const int _timeoutMs = 60000;

  // Frame rate tracking
  int _frameCount = 0;
  late DateTime _fpsStartTime;
  double _achievedFps = 0;

  // Whether we're capturing
  bool _isCapturing = true;
  bool _processingFrame = false;

  @override
  void initState() {
    super.initState();
    final options = PoseDetectorOptions();
    _poseDetector = PoseDetector(options: options);
    _gate = CaptureGate(
      pixelScale: widget.pixelScale,
      calibrationPhotoWidth: widget.calibrationPhotoWidth,
      calibrationPhotoHeight: widget.calibrationPhotoHeight,
      calibrationTaps: widget.calibrationTaps,
    );
    _stopwatch = Stopwatch()..start();
    _fpsStartTime = DateTime.now();
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
      if (_processingFrame || !mounted || !_isCapturing) return;

      _processingFrame = true;
      _detectPose(image).then((_) {
        _processingFrame = false;
      });
    });
  }

  Future<void> _detectPose(CameraImage image) async {
    try {
      _frameCount++;

      // Update FPS
      final now = DateTime.now();
      final elapsedSeconds = now.difference(_fpsStartTime).inMilliseconds / 1000.0;
      if (elapsedSeconds > 0) {
        _achievedFps = _frameCount / elapsedSeconds;
      }

      // Convert camera image to InputImage
      final inputImage = _createInputImage(image);
      if (inputImage == null) return;

      final poses = await _poseDetector.processImage(inputImage);

      // Extract ankle from pose
      PoseLandmark? ankle;
      List<PoseLandmark> landmarksList = [];
      if (poses.isNotEmpty) {
        final pose = poses[0];
        landmarksList = pose.landmarks.values.toList();
        for (final landmark in landmarksList) {
          if (landmark.type == PoseLandmarkType.leftAnkle ||
              landmark.type == PoseLandmarkType.rightAnkle) {
            ankle = landmark;
            break;
          }
        }
      }

      if (!mounted) return;

      // Log periodically
      if (_frameCount % 30 == 0) {
        debugPrint('[velofit] frames=$_frameCount fps=${_achievedFps.toStringAsFixed(1)} '
            'cyclesAfterArming=${_gate.cyclesCountedAfterArming} gateArmed=${_gate.gateArmed} kept=${_keptFrames.length}');
      }

      // One clock read per frame: the buffered frame and the gate sample must
      // carry the SAME stamp, or a keep request can never name a buffered
      // frame.
      final timestampMs = _stopwatch.elapsedMilliseconds;
      _gate.streamImageWidth = image.width.toDouble();

      setState(() {
        // Store frame in buffer
        _frameBuffer.add(_FrameData(
          nv21Bytes: _extractNV21Bytes(image),
          width: image.width,
          height: image.height,
          landmarks: landmarksList,
          timestampMs: timestampMs,
        ));
        if (_frameBuffer.length > _frameBufferSize) {
          _frameBuffer.removeAt(0);
        }

        // Process sample through gate
        if (ankle != null) {
          final sample = AnkleSample(
            x: ankle.x,
            y: ankle.y,
            timestampMs: timestampMs,
            landmarks: landmarksList,
          );

          _gate.processSample(sample, timeoutMs: _timeoutMs);

          // Handle gate state
          if (_gate.captureTimedOut) {
            _isCapturing = false;
          }

          if (_gate.shouldReset) {
            _keptSampleFrames.clear();
            _keptFrames.clear();
            _cycleBottomPoses.clear();
          }

          // Keep frame if requested. The request names the confirmed
          // extremum by timestamp; _frameBuffer.last is the CURRENT frame, a
          // lookahead window later, where the knee has visibly moved on.
          if (_gate.keepThisFrame != null) {
            final request = _gate.keepThisFrame!;
            _FrameData? match;
            for (final frame in _frameBuffer) {
              if (frame.timestampMs == request.timestampMs) {
                match = frame;
                break;
              }
            }
            if (match == null) {
              debugPrint('[velofit] Extremum frame ${request.timestampMs}ms '
                  'fell out of the buffer, skipped');
            } else {
              _keptSampleFrames[request.timestampMs] = match;
            }
          }

          // Store bottom-of-stroke pose if gate is armed
          if (_gate.gateArmed && _gate.cyclesCountedAfterArming > 0) {
            _cycleBottomPoses.add(landmarksList);
            if (_cycleBottomPoses.length > _maxCycleBuffer) {
              _cycleBottomPoses.removeAt(0);
            }
          }

          // Check if capture is complete
          if (_gate.isCaptureComplete() && _keptFrames.length < 5) {
            _encodeKeptFrames();
          }
        } else {
          // No ankle detected
          if (_gate.cyclesCountedAfterArming == 0 && !_gate.gateArmed) {
            // Still looking for rider
          }
        }
      });
    } catch (e) {
      debugPrint('Pose detection error: $e');
    }
  }

  void _encodeKeptFrames() async {
    // Encode all kept frames
    for (final entry in _keptSampleFrames.entries) {
      if (_keptFrames.length >= 5) break;

      final frame = entry.value;
      late PoseLandmark knee;
      var foundKnee = false;
      for (final landmark in frame.landmarks) {
        if (landmark.type == PoseLandmarkType.leftKnee) {
          knee = landmark;
          foundKnee = true;
          break;
        }
      }

      if (!foundKnee) continue;

      // Rescale knee-x from stream to calibration photo pixels
      final streamToCalibrationScale = widget.calibrationPhotoWidth / frame.width;
      final kneeXCalibration = knee.x * streamToCalibrationScale;

      // Encode frame to JPEG
      try {
        final jpegPath = await compute(
          _encodeNV21ToJpeg,
          (frame.nv21Bytes, frame.width, frame.height),
        );

        if (mounted) {
          setState(() {
            _keptFrames.add(_PedalForwardFrame(
              path: jpegPath,
              kneeLandmark: knee,
              kneeX: kneeXCalibration,
              streamImageWidth: frame.width,
              streamImageHeight: frame.height,
            ));
          });
        }
      } catch (e) {
        debugPrint('[velofit] JPEG encoding error: $e');
      }
    }

    if (_keptFrames.length >= 5) {
      _isCapturing = false;
    }
  }

  Uint8List _extractNV21Bytes(CameraImage image) {
    final builder = BytesBuilder(copy: false);
    for (final plane in image.planes) {
      builder.add(plane.bytes);
    }
    return builder.takeBytes();
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

  Map<String, double> _computeAveragedAngles() {
    double totalKneeFlexion = 0;
    double totalHipAngle = 0;
    double totalTorsoAngle = 0;
    double totalElbowAngle = 0;

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
    if (_keptFrames.length < 5) return;

    // Compute angles from bottom-of-stroke cycles
    final averagedAngles = _computeAveragedAngles();

    // Compute median knee-x and spread
    final kneeXValues = _keptFrames.map((f) => f.kneeX).toList();
    final medianKneeX = median(kneeXValues);
    final kneeXSpreadMm = xSpreadMm(kneeXValues, widget.pixelScale);

    // Use the first kept frame's dimensions as representative stream dimensions
    final firstFrame = _keptFrames[0];

    Navigator.of(context).pushNamed(
      '/bike_point',
      arguments: {
        'wheelDiameter': widget.wheelDiameter,
        'pixelScale': widget.pixelScale,
        'pedalForwardImage': firstFrame.path,
        'medianKneeX': medianKneeX,
        'kneeXSpreadMm': kneeXSpreadMm,
        'calibrationPhotoWidth': widget.calibrationPhotoWidth,
        'calibrationPhotoHeight': widget.calibrationPhotoHeight,
        'streamImageWidth': firstFrame.streamImageWidth.toDouble(),
        'streamImageHeight': firstFrame.streamImageHeight.toDouble(),
        'bbPoint': widget.bbPoint,
        'saddlePoint': widget.saddlePoint,
        'kneeFlexion': averagedAngles['kneeFlexion'] ?? 0,
        'hipAngle': averagedAngles['hipAngle'] ?? 0,
        'torsoAngle': averagedAngles['torsoAngle'] ?? 0,
        'elbowAngle': averagedAngles['elbowAngle'] ?? 0,
        'pedalForwardKneeLandmark': _keptFrames[0].kneeLandmark,
      },
    );
  }

  @override
  void dispose() {
    _stopwatch.stop();
    _cameraController.dispose();
    _poseDetector.close();
    super.dispose();
  }

  Color _getStatusColor() {
    if (_gate.failureReason != null) return Colors.red;
    if (!_gate.gateArmed) return Colors.red;
    if (_keptFrames.length < 5) return Colors.amber;
    return Colors.green;
  }

  String _getStatusText() {
    if (_gate.failureReason != null) return _gate.failureReason!;
    if (!_gate.hasRider()) return 'No rider detected';
    if (!_gate.gateArmed) return 'Rider seen, no steady pedaling';
    if (_keptFrames.length < 5) return 'Detecting...';
    return 'Captured OK';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pedaling Capture')),
      body: _cameraReady
          ? Stack(
              children: [
                Positioned.fill(child: FillPreview(_cameraController)),
                // Status band
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    color: _getStatusColor(),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _getStatusText(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (_gate.gateArmed)
                          Text(
                            '${_gate.getAverageCadenceRpm().toStringAsFixed(0)} RPM',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Counting ${_keptFrames.length}/5',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Text(
                              'FPS: ${_achievedFps.toStringAsFixed(1)}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                // Done button
                Positioned(
                  bottom: 16,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: ElevatedButton(
                      onPressed:
                          _keptFrames.length >= 5 && !_isCapturing ? _proceed : null,
                      child: _isCapturing
                          ? const Text('Capturing...')
                          : Text('Done (${_keptFrames.length} frames, '
                              '${_achievedFps.toStringAsFixed(1)} fps)'),
                    ),
                  ),
                ),
              ],
            )
          : const Center(child: Text('Initializing camera...')),
    );
  }
}

/// Encode NV21 bytes to JPEG using the image package.
/// Runs off the UI isolate via compute().
Future<String> _encodeNV21ToJpeg(
  (Uint8List, int, int) data,
) async {
  final (nv21Bytes, width, height) = data;

  try {
    // Convert NV21 to RGB
    final image = img.Image(width: width, height: height);
    _nv21ToRgb(nv21Bytes, image);

    // Encode to JPEG
    final jpegBytes = img.encodeJpg(image);

    // Save to app-private storage
    final dir = await _getAppPrivateDir();
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final path = '$dir/pedal_forward_$timestamp.jpg';
    final file = File(path);
    await file.writeAsBytes(jpegBytes);

    return path;
  } catch (e) {
    debugPrint('[velofit] JPEG encoding error: $e');
    rethrow;
  }
}

void _nv21ToRgb(Uint8List nv21, img.Image image) {
  final width = image.width;
  final height = image.height;
  final ySize = width * height;

  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {
      final pixelIndex = y * width + x;
      final yIndex = pixelIndex;
      final uvIndex = ySize + (y ~/ 2) * width + (x ~/ 2) * 2;

      final yVal = nv21[yIndex] & 0xFF;
      final vVal = (nv21[uvIndex] & 0xFF) - 128;
      final uVal = (nv21[uvIndex + 1] & 0xFF) - 128;

      var r = (yVal + 1.402 * vVal).toInt().clamp(0, 255);
      var g = (yVal - 0.344136 * uVal - 0.714136 * vVal).toInt().clamp(0, 255);
      var b = (yVal + 1.772 * uVal).toInt().clamp(0, 255);

      image.setPixelRgba(x, y, r, g, b, 255);
    }
  }
}

Future<String> _getAppPrivateDir() async {
  final dir = Directory.systemTemp.createTempSync('velofit_pedal');
  return dir.path;
}
