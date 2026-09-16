import 'dart:io';
import 'dart:ui' as ui;
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import '../angle_utils.dart';
import '../widgets/camera_fill.dart';
import '../widgets/point_picker.dart';

class CalibrationScreen extends StatefulWidget {
  final double wheelDiameter;

  const CalibrationScreen({super.key, required this.wheelDiameter});

  @override
  State<CalibrationScreen> createState() => _CalibrationScreenState();
}

class _CalibrationScreenState extends State<CalibrationScreen> {
  late CameraController _cameraController;
  bool _cameraReady = false;
  XFile? _capturedImage;
  Size? _photoSize;
  List<Offset> _tappedPoints = [];
  int? _activeIndex;
  final List<String> _labels = [
    'Top of front wheel',
    'Bottom of front wheel',
    'Bottom bracket',
    'Saddle top',
  ];

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  Future<void> _initCamera() async {
    final status = await Permission.camera.request();
    if (!status.isGranted) return;

    final cameras = await availableCameras();
    if (cameras.isEmpty) return;

    _cameraController = CameraController(
      cameras[0],
      ResolutionPreset.high,
      // Stills only. Without this the controller defaults to audio on and
      // Android prompts for the microphone, which this app never uses.
      enableAudio: false,
    );

    try {
      await _cameraController.initialize();
      if (mounted) setState(() => _cameraReady = true);
    } catch (e) {
      debugPrint('Camera init error: $e');
    }
  }

  Future<void> _takePhoto() async {
    if (!_cameraReady) return;
    try {
      final image = await _cameraController.takePicture();

      // Decode photo to get pixel dimensions
      final bytes = await image.readAsBytes();
      final codec = await ui.instantiateImageCodec(bytes);
      final frame = await codec.getNextFrame();
      final photoSize = Size(
        frame.image.width.toDouble(),
        frame.image.height.toDouble(),
      );
      frame.image.dispose();

      setState(() {
        _capturedImage = image;
        _photoSize = photoSize;
        _tappedPoints = [];
      });
    } catch (e) {
      debugPrint('Photo error: $e');
    }
  }

  /// A point is created on touch-down, so while one is being positioned the
  /// plain tap count already names the next point. Name the one under the
  /// finger instead.
  String _bannerText() {
    final active = _activeIndex;
    if (active != null) {
      return 'Point ${active + 1}: ${_labels[active]} — drag to adjust';
    }
    if (_tappedPoints.length < 4) {
      return 'Tap point ${_tappedPoints.length + 1}: '
          '${_labels[_tappedPoints.length]}';
    }
    return 'All four points placed. Check them, then continue.';
  }

  void _undoTap() {
    if (_tappedPoints.isEmpty) return;
    setState(() => _tappedPoints.removeLast());
  }

  void _retakePhoto() {
    setState(() {
      _capturedImage = null;
      _photoSize = null;
      _tappedPoints = [];
      _activeIndex = null;
    });
  }

  void _proceed() {
    if (_capturedImage == null || _photoSize == null) return;

    final problem = calibrationProblem(
      _tappedPoints,
      widget.wheelDiameter,
      minWheelPixels: _photoSize!.shortestSide * 0.05,
    );
    if (problem != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(problem), duration: const Duration(seconds: 6)),
      );
      return;
    }

    final pixelScale = pixelScaleFromTaps(_tappedPoints, widget.wheelDiameter);

    Navigator.of(context).pushNamed(
      '/pedaling',
      arguments: {
        'wheelDiameter': widget.wheelDiameter,
        'pixelScale': pixelScale,
        'calibrationImage': _capturedImage!.path,
        'bbPoint': _tappedPoints[2],
        'saddlePoint': _tappedPoints[3],
      },
    );
  }

  @override
  void dispose() {
    _cameraController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Calibration Capture'),
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline),
            tooltip: 'How to Measure',
            onPressed: () => Navigator.of(context).pushNamed('/how_to'),
          ),
        ],
      ),
      body: _capturedImage == null
          ? (_cameraReady
              ? Stack(
                  children: [
                    Positioned.fill(child: FillPreview(_cameraController)),
                    Positioned(
                      bottom: 16,
                      left: 0,
                      right: 0,
                      child: Center(
                        child: ElevatedButton(
                          onPressed: _takePhoto,
                          child: const Text('Capture Photo'),
                        ),
                      ),
                    ),
                  ],
                )
              : const Center(child: Text('Initializing camera...')))
          : _buildCalibrationTapScreen(),
    );
  }

  Widget _buildCalibrationTapScreen() {
    if (_photoSize == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return Stack(
      children: [
        Positioned.fill(
          child: PointPicker(
            imageFile: File(_capturedImage!.path),
            photoSize: _photoSize!,
            points: _tappedPoints,
            onChanged: (points) => setState(() => _tappedPoints = points),
            maxPoints: 4,
            onActiveIndexChanged: (index) =>
                setState(() => _activeIndex = index),
          ),
        ),
        Positioned(
          top: 16,
          left: 16,
          right: 16,
          child: Container(
            padding: const EdgeInsets.all(8),
            color: Colors.black54,
            child: Text(
              _bannerText(),
              style: const TextStyle(color: Colors.white),
            ),
          ),
        ),
        Positioned(
          bottom: 16,
          left: 16,
          right: 16,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              ElevatedButton.icon(
                onPressed: _tappedPoints.isEmpty ? null : _undoTap,
                icon: const Icon(Icons.undo),
                label: const Text('Undo'),
              ),
              ElevatedButton.icon(
                onPressed: _retakePhoto,
                icon: const Icon(Icons.camera_alt),
                label: const Text('Retake'),
              ),
              ElevatedButton.icon(
                onPressed: _tappedPoints.length == 4 ? _proceed : null,
                icon: const Icon(Icons.check),
                label: const Text('Continue'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
