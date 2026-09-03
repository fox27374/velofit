import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import '../angle_utils.dart';

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
  List<Offset> _tappedPoints = [];
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
      setState(() {
        _capturedImage = image;
        _tappedPoints = [];
      });
    } catch (e) {
      debugPrint('Photo error: $e');
    }
  }

  void _handleImageTap(Offset position) {
    if (_tappedPoints.length >= 4) return;
    setState(() => _tappedPoints.add(position));
  }

  void _undoTap() {
    if (_tappedPoints.isEmpty) return;
    setState(() => _tappedPoints.removeLast());
  }

  void _retakePhoto() {
    setState(() {
      _capturedImage = null;
      _tappedPoints = [];
    });
  }

  void _proceed() {
    if (_capturedImage == null) return;

    final problem = calibrationProblem(_tappedPoints, widget.wheelDiameter);
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
                    CameraPreview(_cameraController),
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
    return Stack(
      children: [
        Image.file(File(_capturedImage!.path), fit: BoxFit.contain),
        Positioned.fill(
          child: GestureDetector(
            onTapDown: (details) => _handleImageTap(details.localPosition),
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
              _tappedPoints.length < 4
                  ? 'Tap point ${_tappedPoints.length + 1}: '
                      '${_labels[_tappedPoints.length]}'
                  : 'All four points placed. Check them, then continue.',
              style: const TextStyle(color: Colors.white),
            ),
          ),
        ),
        ..._tappedPoints.asMap().entries.map(
              (e) => Positioned(
                left: e.value.dx - 8,
                top: e.value.dy - 8,
                child: Container(
                  width: 16,
                  height: 16,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.red, width: 2),
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    '${e.key + 1}',
                    style: const TextStyle(
                      color: Colors.red,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
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
