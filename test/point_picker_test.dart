import 'package:flutter_test/flutter_test.dart';
import 'package:velofit/widgets/point_picker.dart' show nearestPointIndex;

void main() {
  group('nearestPointIndex', () {
    test('returns null when nothing is inside the radius', () {
      final points = [
        const Offset(0, 0),
        const Offset(100, 100),
      ];
      final target = const Offset(200, 200);
      final radius = 30.0;

      final result = nearestPointIndex(points, target, radius);
      expect(result, isNull);
    });

    test('returns the nearest index when two candidates are in range', () {
      final points = [
        const Offset(0, 0),
        const Offset(50, 0),
        const Offset(100, 0),
      ];
      final target = const Offset(60, 0);
      final radius = 20.0;

      // Points 1 (50,0) and 2 (100,0) are both in range
      // Point 1 is closer (distance 10)
      final result = nearestPointIndex(points, target, radius);
      expect(result, 1);
    });

    test('respects the radius boundary', () {
      final points = [
        const Offset(0, 0),
        const Offset(100, 0),
      ];
      final target = const Offset(49, 0);
      final radius = 50.0;

      // Point 0 is at distance 49, inside the radius
      final resultInside = nearestPointIndex(points, target, radius);
      expect(resultInside, 0);

      // With a smaller radius, nothing should be found
      final resultOutside = nearestPointIndex(points, target, 48.0);
      expect(resultOutside, isNull);
    });
  });
}
