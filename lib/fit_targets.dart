/// Target ranges for bike fit measurements.
class FitTargets {
  /// Knee flexion angle at bottom-of-stroke: 25–35 degrees.
  static const double kneeFlexionMin = 25;
  static const double kneeFlexionMax = 35;

  /// Hip angle (shoulder-hip-knee interior) at bottom-of-stroke: 90-105 degrees.
  ///
  /// Measured at the BOTTOM of the stroke, which is where the hip is most OPEN,
  /// so this is the maximum hip angle over the pedal cycle. Published hip-angle
  /// targets are almost always the minimum, at the TOP of the stroke, and are
  /// roughly 45-50 degrees smaller — do not compare the two.
  ///
  /// Source: Velogic Studio road metrics, the only located source publishing a
  /// max (bottom-of-stroke) hip angle. See doc/fit-targets-research.md.
  static const double hipAngleMin = 90;
  static const double hipAngleMax = 105;

  /// Torso angle from horizontal: 45–55 degrees.
  static const double torsoAngleMin = 45;
  static const double torsoAngleMax = 55;

  /// Elbow angle: 150–165 degrees.
  static const double elbowAngleMin = 150;
  static const double elbowAngleMax = 165;

  /// Color coding thresholds: "good" (in range), "warning" (10% outside), "poor" (further).
  static bool isGood(double value, double min, double max) => value >= min && value <= max;

  static bool isWarning(double value, double min, double max) {
    final range = max - min;
    return (value >= min - range * 0.1 && value < min) ||
        (value > max && value <= max + range * 0.1);
  }

  static bool isPoor(double value, double min, double max) {
    final range = max - min;
    return value < min - range * 0.1 || value > max + range * 0.1;
  }
}
