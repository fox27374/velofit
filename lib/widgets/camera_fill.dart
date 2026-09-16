import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Camera preview that fills its box in any device orientation, cropping
/// rather than letterboxing. Orientation comes from the controller's own
/// CameraValue so this box and CameraPreview's internal AspectRatio can
/// never disagree.
class FillPreview extends StatelessWidget {
  const FillPreview(this.controller, {super.key});
  final CameraController controller;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<CameraValue>(
      valueListenable: controller,
      builder: (context, value, child) {
        if (!value.isInitialized || value.previewSize == null) {
          return const SizedBox.shrink();
        }

        final s = value.previewSize!;
        final deviceOrientation =
            value.previewPauseOrientation ??
            value.lockedCaptureOrientation ??
            value.deviceOrientation;
        final landscape = deviceOrientation == DeviceOrientation.landscapeLeft ||
            deviceOrientation == DeviceOrientation.landscapeRight;

        return ClipRect(
          child: FittedBox(
            fit: BoxFit.cover,
            child: SizedBox(
              width: landscape ? s.width : s.height,
              height: landscape ? s.height : s.width,
              child: CameraPreview(controller),
            ),
          ),
        );
      },
    );
  }
}
