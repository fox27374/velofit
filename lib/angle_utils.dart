import 'dart:math';
import 'package:flutter/material.dart';

// Constants for pedaling capture validity gate.
// These are reasoned and unvalidated against real captures.

/// Minimum cadence in RPM. Below this, the rider is pedaling too slowly.
const int minCadenceRpm = 40;

/// Maximum cadence in RPM. Above this, pedaling is unrealistically fast.
const int maxCadenceRpm = 110;

/// Tolerance for interval consistency: intervals must be within ±20% of
/// the running median to count as steady pedaling.
const double intervalConsistencyTolerance = 0.20;

/// Number of consecutive valid intervals required to arm the gate and
/// start counting cycles (requires K=3 intervals, which involves 4 peaks).
const int intervalsBeforeArming = 3;

/// Minimum ankle vertical travel per stroke in millimeters. Below this,
/// the rider is not pedaling with sufficient amplitude.
const double minAnkleVerticalTravelMm = 150.0;

/// Maximum spread in knee-x across 5 kept frames in millimeters before
/// warning that knee detection may be unreliable.
const double maxKneeXSpreadMm = 15.0;

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

/// Compute the median of a list of doubles. Assumes the list is non-empty.
double median(List<double> values) {
  if (values.isEmpty) return 0;
  final sorted = List<double>.from(values)..sort();
  final mid = sorted.length ~/ 2;
  if (sorted.length % 2 == 1) {
    return sorted[mid];
  } else {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
}

/// Check if a sequence of intervals implies steady pedaling within the
/// valid cadence and consistency range. Returns true if all intervals pass.
/// [intervals]: time deltas between consecutive peaks, in seconds
/// [unused]: kept for backward compatibility; no longer used
/// Returns true if all intervals satisfy cadence and consistency bounds.
/// One confirmed peak per crank revolution; cadence = 60 seconds / interval seconds.
bool areIntervalsValid(List<double> intervals, double unused) {
  if (intervals.isEmpty) return false;

  // intervals are already in seconds
  final intervalSeconds = intervals;

  // Cadence = 60 / interval_seconds (one peak per revolution)
  final rpms = intervalSeconds.map((s) => 60 / s).toList();

  // Check cadence bounds
  for (final rpm in rpms) {
    if (rpm < minCadenceRpm || rpm > maxCadenceRpm) {
      return false;
    }
  }

  // Check consistency: each interval must be within ±20% of the running median
  final medianInterval = median(intervalSeconds);
  final minInterval = medianInterval * (1 - intervalConsistencyTolerance);
  final maxInterval = medianInterval * (1 + intervalConsistencyTolerance);

  for (final interval in intervalSeconds) {
    if (interval < minInterval || interval > maxInterval) {
      return false;
    }
  }

  return true;
}

/// Compute the vertical travel of the ankle in pixels, given a list of
/// ankle Y values. Returns the difference between min and max.
double ankleVerticalTravelPixels(List<double> ankleYValues) {
  if (ankleYValues.isEmpty) return 0;
  return ankleYValues.reduce((a, b) => a > b ? a : b) -
      ankleYValues.reduce((a, b) => a < b ? a : b);
}

/// Compute the spread (max - min) of X values in millimeters.
double xSpreadMm(List<double> xValuesPixels, double pixelScale) {
  if (xValuesPixels.isEmpty) return 0;
  final maxX = xValuesPixels.reduce((a, b) => a > b ? a : b);
  final minX = xValuesPixels.reduce((a, b) => a < b ? a : b);
  return pixelsToMm(maxX - minX, pixelScale);
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

/// Sentinel for a measurement no valid pedal cycle produced. Kept as a double
/// so it flows through the existing route arguments unchanged; every display
/// site must check `isNaN` rather than printing it.
const double unavailableMeasurement = double.nan;

/// Checks the four calibration taps before they become a scale factor.
///
/// Order is [top of wheel, bottom of wheel, bottom bracket, saddle top], in
/// photo-pixel coordinates (or widget coordinates for backwards compatibility),
/// so y grows downward. Returns a problem to show the user, or null if the taps
/// are usable. A bad tap here silently corrupts every millimetre figure
/// downstream, so it is worth blocking on.
String? calibrationProblem(
  List<Offset> taps,
  double wheelDiameterMm, {
  double minWheelPixels = 50,
}) {
  if (taps.length != 4) return 'Tap all four points.';

  if (wheelDiameterMm < 300 || wheelDiameterMm > 1000) {
    return 'Wheel diameter of ${wheelDiameterMm.toStringAsFixed(0)} mm is not '
        'a bike wheel. Enter the outer diameter including the tyre, typically '
        '650–740 mm.';
  }

  final wheelPixels = (taps[1].dy - taps[0].dy).abs();
  if (wheelPixels < minWheelPixels) {
    return 'The two wheel taps are almost on top of each other. Tap the top '
        'of the front wheel, then the bottom.';
  }

  if (taps[0].dy > taps[1].dy) {
    return 'The wheel taps look swapped: tap the top of the wheel first, then '
        'the bottom.';
  }

  if (taps[3].dy > taps[2].dy) {
    return 'The saddle tap is below the bottom bracket. Tap the bottom '
        'bracket third, then the top of the saddle.';
  }

  // Check that the wheel and bottom bracket x are not nearly the same
  // (phone must be square to the bike, not angled)
  final wheelX = (taps[0].dx + taps[1].dx) / 2; // Average wheel x
  final bbX = taps[2].dx;
  final xDiff = (wheelX - bbX).abs();
  if (xDiff < 10) {
    // Threshold for "too close": less than 10 pixels means phone is not
    // square to the bike frame
    return 'The front wheel and bottom bracket taps are nearly at the same '
        'horizontal position. Hold the phone more square to the bike.';
  }

  return null;
}

/// Determine which ankle-X extremum means pedal-forward based on calibration taps.
/// Returns true if pedal-forward is maximum ankle-x, false if minimum.
/// [taps]: calibration taps in order [wheel-top, wheel-bottom, bb, saddle]
bool isPedalForwardMaxX(List<Offset> taps) {
  if (taps.length < 3) return true; // Safe default
  final wheelX = (taps[0].dx + taps[1].dx) / 2; // Average wheel x
  final bbX = taps[2].dx;
  // If wheel is to the right of BB, pedal-forward is max ankle-x
  return wheelX > bbX;
}

/// Pixels per millimetre from the calibration taps. Call only once
/// [calibrationProblem] has returned null.
double pixelScaleFromTaps(List<Offset> taps, double wheelDiameterMm) =>
    (taps[1].dy - taps[0].dy).abs() / wheelDiameterMm;

/// Flags results that are outside anything a real bike fit produces, so a
/// broken capture reads as "recapture" instead of as a confident number.
///
/// These are not fit targets (those live in FitTargets) — they are bounds on
/// physical possibility, wide enough that a valid fit never trips them.
List<String> measurementProblems({
  required double kneeFlexion,
  required double hipAngle,
  required double torsoAngle,
  required double elbowAngle,
  required double kopsOffsetMm,
  required double saddleHeightMm,
  double? kneeXSpreadMm,
}) {
  final problems = <String>[];

  const angleNames = ['Knee flexion', 'Hip angle', 'Torso angle', 'Elbow angle'];
  final angles = [kneeFlexion, hipAngle, torsoAngle, elbowAngle];
  final missing = <String>[];
  for (var i = 0; i < angles.length; i++) {
    if (angles[i].isNaN) missing.add(angleNames[i]);
  }
  if (missing.isNotEmpty) {
    problems.add(
      '${missing.join(', ')} could not be measured — the pose detector never '
      'saw those joints. Check the rider is fully in frame and well lit.',
    );
  }

  if (!saddleHeightMm.isNaN &&
      (saddleHeightMm < 400 || saddleHeightMm > 1000)) {
    problems.add(
      'Saddle height of ${saddleHeightMm.toStringAsFixed(0)} mm is outside '
      'any real bike (400–1000 mm). The calibration taps or the wheel '
      'diameter are probably wrong.',
    );
  }

  if (!kopsOffsetMm.isNaN && kopsOffsetMm > 250) {
    problems.add(
      'KOPS offset of ${kopsOffsetMm.toStringAsFixed(0)} mm is far larger '
      'than a bike allows. The pedal spindle tap or the knee detection is '
      'likely off.',
    );
  }

  if (kneeXSpreadMm != null &&
      !kneeXSpreadMm.isNaN &&
      kneeXSpreadMm > maxKneeXSpreadMm) {
    problems.add(
      'Knee position spread of ${kneeXSpreadMm.toStringAsFixed(0)} mm is too '
      'large. The knee detection may be unreliable — recapture recommended.',
    );
  }

  return problems;
}
