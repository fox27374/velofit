import 'dart:math';
import 'package:flutter/material.dart';

/// Compute interior angle at vertex given three points.
/// Returns angle in degrees [0, 180].
double interiorAngle(
  ({double x, double y}) p1,
  ({double x, double y}) p2,
  ({double x, double y}) p3,
) {
  final v1x = p1.x - p2.x;
  final v1y = p1.y - p2.y;
  final v2x = p3.x - p2.x;
  final v2y = p3.y - p2.y;

  final dot = v1x * v2x + v1y * v2y;
  final mag1 = sqrt(v1x * v1x + v1y * v1y);
  final mag2 = sqrt(v2x * v2x + v2y * v2y);

  if (mag1 == 0 || mag2 == 0) return 0;

  final cosAngle = dot / (mag1 * mag2);
  final clipped = cosAngle.clamp(-1.0, 1.0);
  return acos(clipped) * 180 / pi;
}

/// Compute angle from horizontal for a line segment (p1 -> p2).
/// Returns angle in degrees [-180, 180], where 0 is horizontal right,
/// 90 is vertical down, -90 is vertical up.
double angleFromHorizontal(
  ({double x, double y}) p1,
  ({double x, double y}) p2,
) {
  final dx = p2.x - p1.x;
  final dy = p2.y - p1.y;
  return atan2(dy, dx) * 180 / pi;
}

/// Convert pixel distance to mm using calibration scale.
double pixelsToMm(double pixels, double pixelScale) {
  if (pixelScale == 0) return 0;
  return pixels / pixelScale;
}

/// Convert mm distance to pixels using calibration scale.
double mmToPixels(double mm, double pixelScale) {
  return mm * pixelScale;
}

/// Knee flexion angle: 180° - interior angle at knee.
/// Returns angle in degrees. Target: 25–35°.
double kneeFlexion(
  ({double x, double y}) hip,
  ({double x, double y}) knee,
  ({double x, double y}) ankle,
) {
  final interior = interiorAngle(hip, knee, ankle);
  return 180 - interior;
}

/// Hip angle: interior angle at hip (shoulder-hip-knee).
/// Returns angle in degrees. Target: ~45°.
double hipAngle(
  ({double x, double y}) shoulder,
  ({double x, double y}) hip,
  ({double x, double y}) knee,
) {
  return interiorAngle(shoulder, hip, knee);
}

/// Torso angle from horizontal (shoulder-hip line).
/// Returns angle in degrees [0, 180] from horizontal.
/// Target: 45–55°.
double torsoAngle(
  ({double x, double y}) shoulder,
  ({double x, double y}) hip,
) {
  final angle = angleFromHorizontal(shoulder, hip);
  // Clamp to [0, 180] for readability
  var result = angle.abs();
  if (result > 180) result = 360 - result;
  return result;
}

/// Elbow angle: interior angle at elbow.
/// Returns angle in degrees. Target: 150–165°.
double elbowAngle(
  ({double x, double y}) shoulder,
  ({double x, double y}) elbow,
  ({double x, double y}) wrist,
) {
  return interiorAngle(shoulder, elbow, wrist);
}

/// Simple local-max peak detection.
/// Returns true if sample is a peak within ±window samples.
bool isPeak(List<double> samples, int index, int windowSamples) {
  if (index < windowSamples || index >= samples.length - windowSamples) {
    return false;
  }
  final val = samples[index];
  for (int i = index - windowSamples; i <= index + windowSamples; i++) {
    if (i != index && samples[i] > val) return false;
  }
  return true;
}

/// Convert a point from photo-pixel space to widget-pixel space using BoxFit.contain.
/// [photoPixel]: coordinate in the original photo's pixel dimensions
/// [photoSize]: original photo dimensions (width, height)
/// [widgetSize]: rendered widget size (width, height)
/// Returns coordinate in widget/on-screen space, accounting for letterboxing and scaling.
Offset photoPixelToWidget(
  Offset photoPixel,
  Size photoSize,
  Size widgetSize,
) {
  if (photoSize.width == 0 || photoSize.height == 0) {
    return Offset.zero;
  }

  // Compute BoxFit.contain scaling: fit photo into widget
  final photoAspect = photoSize.width / photoSize.height;
  final widgetAspect = widgetSize.width / widgetSize.height;

  late double scale;
  late Offset offset;

  if (photoAspect > widgetAspect) {
    // Photo is wider; constrained by widget width
    scale = widgetSize.width / photoSize.width;
    final scaledHeight = photoSize.height * scale;
    offset = Offset(0, (widgetSize.height - scaledHeight) / 2);
  } else {
    // Photo is taller; constrained by widget height
    scale = widgetSize.height / photoSize.height;
    final scaledWidth = photoSize.width * scale;
    offset = Offset((widgetSize.width - scaledWidth) / 2, 0);
  }

  return Offset(
    photoPixel.dx * scale + offset.dx,
    photoPixel.dy * scale + offset.dy,
  );
}

/// Convert a point from widget-pixel space back to photo-pixel space.
/// Inverse of [photoPixelToWidget].
Offset widgetToPhotoPixel(
  Offset widgetPixel,
  Size photoSize,
  Size widgetSize,
) {
  if (photoSize.width == 0 || photoSize.height == 0) {
    return Offset.zero;
  }

  final photoAspect = photoSize.width / photoSize.height;
  final widgetAspect = widgetSize.width / widgetSize.height;

  late double scale;
  late Offset offset;

  if (photoAspect > widgetAspect) {
    scale = widgetSize.width / photoSize.width;
    final scaledHeight = photoSize.height * scale;
    offset = Offset(0, (widgetSize.height - scaledHeight) / 2);
  } else {
    scale = widgetSize.height / photoSize.height;
    final scaledWidth = photoSize.width * scale;
    offset = Offset((widgetSize.width - scaledWidth) / 2, 0);
  }

  return Offset(
    (widgetPixel.dx - offset.dx) / scale,
    (widgetPixel.dy - offset.dy) / scale,
  );
}
