/// Target ranges for bike fit measurements.
class FitTargets {
  /// Knee flexion angle at bottom-of-stroke: 25–35 degrees.
  static const double kneeFlexionMin = 25;
  static const double kneeFlexionMax = 35;

  /// Hip angle: ~45 degrees.
  static const double hipAngleMin = 40;
  static const double hipAngleMax = 50;

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
