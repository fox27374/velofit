import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import '../angle_utils.dart';

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
  final Size? pedalForwardImageSize;

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
    required this.pedalForwardImageSize,
  });

  @override
  State<BikePointScreen> createState() => _BikePointScreenState();
}

class _BikePointScreenState extends State<BikePointScreen> {
  Offset? _pedalTapPoint;
  Size? _imageWidgetSize;

  void _handleImageTap(Offset position) {
    setState(() => _pedalTapPoint = position);
  }

  void _clearTap() => setState(() => _pedalTapPoint = null);

  void _proceed() {
    if (_pedalTapPoint == null || _imageWidgetSize == null) return;

    // No knee landmark means no KOPS — report it as unmeasured rather than 0.
    double kopsOffset = unavailableMeasurement;
    if (widget.pedalForwardKneeLandmark != null &&
        widget.pedalForwardImageSize != null) {
      // Convert knee landmark from photo-pixel space to widget-pixel space
      final kneeLandmark = widget.pedalForwardKneeLandmark!;
      final kneePhotoPixel = Offset(kneeLandmark.x, kneeLandmark.y);
      final kneeWidgetPixel = photoPixelToWidget(
        kneePhotoPixel,
        widget.pedalForwardImageSize!,
        _imageWidgetSize!,
      );

      // Calculate KOPS: horizontal distance between knee and tapped pedal spindle
      final pixelOffset = (_pedalTapPoint!.dx - kneeWidgetPixel.dx).abs();
      kopsOffset = pixelsToMm(pixelOffset, widget.pixelScale);
    }

    // Calculate saddle height: pixel distance between tapped BB and saddle-top (from calibration)
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
      body: LayoutBuilder(
        builder: (context, constraints) {
          return Stack(
            children: [
              Center(
                child: SizedBox(
                  width: constraints.maxWidth,
                  height: constraints.maxHeight,
                  child: Builder(
                    builder: (context) {
                      WidgetsBinding.instance.addPostFrameCallback((_) {
                        final renderBox = context.findRenderObject() as RenderBox?;
                        if (renderBox != null && _imageWidgetSize == null) {
                          setState(() {
                            _imageWidgetSize =
                                renderBox.size;
                          });
                        }
                      });
                      return Image.file(
                        File(widget.pedalForwardImage),
                        fit: BoxFit.contain,
                      );
                    },
                  ),
                ),
              ),
              Positioned.fill(
                child: GestureDetector(
                  onTapDown: (details) =>
                      _handleImageTap(details.localPosition),
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
              if (_pedalTapPoint != null)
                Positioned(
                  left: _pedalTapPoint!.dx - 8,
                  top: _pedalTapPoint!.dy - 8,
                  child: Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.green, width: 2),
                      shape: BoxShape.circle,
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
          );
        },
      ),
    );
  }
}
