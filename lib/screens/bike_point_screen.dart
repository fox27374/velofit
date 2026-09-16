import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import '../angle_utils.dart';
import '../widgets/point_picker.dart';

class BikePointScreen extends StatefulWidget {
  final double wheelDiameter;
  final double pixelScale;
  final String pedalForwardImage;
  final Offset bbPoint;
  final Offset saddlePoint;
  final double kneeFlexion;
  final double hipAngle;
  final double torsoAngle;
  final double elbowAngle;
  final PoseLandmark? pedalForwardKneeLandmark;

  const BikePointScreen({
    super.key,
    required this.wheelDiameter,
    required this.pixelScale,
    required this.pedalForwardImage,
    required this.bbPoint,
    required this.saddlePoint,
    required this.kneeFlexion,
    required this.hipAngle,
    required this.torsoAngle,
    required this.elbowAngle,
    required this.pedalForwardKneeLandmark,
  });

  @override
  State<BikePointScreen> createState() => _BikePointScreenState();
}

class _BikePointScreenState extends State<BikePointScreen> {
  Offset? _pedalTapPoint;
  Size? _pedalForwardImageSize;

  @override
  void initState() {
    super.initState();
    _loadImageSize();
  }

  Future<void> _loadImageSize() async {
    try {
      final bytes = await File(widget.pedalForwardImage).readAsBytes();
      final codec = await ui.instantiateImageCodec(bytes);
      final frame = await codec.getNextFrame();
      final imageSize = Size(
        frame.image.width.toDouble(),
        frame.image.height.toDouble(),
      );
      frame.image.dispose();

      if (mounted) {
        setState(() {
          _pedalForwardImageSize = imageSize;
        });
      }
    } catch (e) {
      debugPrint('Error loading image size: $e');
    }
  }

  void _clearTap() => setState(() => _pedalTapPoint = null);

  void _proceed() {
    if (_pedalTapPoint == null) return;

    // No knee landmark means no KOPS — report it as unmeasured rather than 0.
    double kopsOffset = unavailableMeasurement;
    if (widget.pedalForwardKneeLandmark != null) {
      // Knee landmark is already in photo-pixel space
      final kneeLandmark = widget.pedalForwardKneeLandmark!;
      // Calculate KOPS: horizontal distance between knee and tapped pedal spindle
      final pixelOffset = (_pedalTapPoint!.dx - kneeLandmark.x).abs();
      kopsOffset = pixelsToMm(pixelOffset, widget.pixelScale);
    }

    // Calculate saddle height: pixel distance between tapped BB and saddle-top (from calibration)
    // Both are in photo-pixel space
    final saddleHeightPixels =
        (widget.saddlePoint.dy - widget.bbPoint.dy).abs();
    final saddleHeight = pixelsToMm(saddleHeightPixels, widget.pixelScale);

    Navigator.of(context).pushNamed(
      '/results',
      arguments: {
        'wheelDiameter': widget.wheelDiameter,
        'pixelScale': widget.pixelScale,
        'kneeFlexion': widget.kneeFlexion,
        'hipAngle': widget.hipAngle,
        'torsoAngle': widget.torsoAngle,
        'elbowAngle': widget.elbowAngle,
        'kopsOffset': kopsOffset,
        'saddleHeight': saddleHeight,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bike Point Tap')),
      body: _pedalForwardImageSize == null
          ? const Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                Positioned.fill(
                  child: PointPicker(
                    imageFile: File(widget.pedalForwardImage),
                    photoSize: _pedalForwardImageSize!,
                    points: _pedalTapPoint != null ? [_pedalTapPoint!] : [],
                    onChanged: (points) => setState(() {
                      _pedalTapPoint = points.isNotEmpty ? points[0] : null;
                    }),
                    maxPoints: 1,
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
                      _pedalTapPoint == null
                          ? 'Tap the pedal spindle center'
                          : 'Tap again to move the marker, then continue.',
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
                        onPressed: _pedalTapPoint == null ? null : _clearTap,
                        icon: const Icon(Icons.undo),
                        label: const Text('Clear'),
                      ),
                      ElevatedButton.icon(
                        onPressed: _pedalTapPoint == null ? null : _proceed,
                        icon: const Icon(Icons.check),
                        label: const Text('Continue'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
