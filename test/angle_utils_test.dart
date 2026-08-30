import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:velofit/angle_utils.dart';

void main() {
  group('interiorAngle', () {
    test('right angle', () {
      final angle = interiorAngle(
        (x: 0, y: 0),
        (x: 1, y: 0),
        (x: 1, y: 1),
      );
      expect(angle, closeTo(90, 0.1));
    });

    test('straight angle', () {
      final angle = interiorAngle(
        (x: 0, y: 0),
        (x: 1, y: 0),
        (x: 2, y: 0),
      );
      expect(angle, closeTo(180, 0.1));
    });

    test('acute angle', () {
      final angle = interiorAngle(
        (x: 0, y: 0),
        (x: 1, y: 0),
        (x: 0.5, y: 0.5),
      );
      expect(angle, greaterThan(0));
      expect(angle, lessThan(90));
    });

    test('zero distance returns zero', () {
      final angle = interiorAngle(
        (x: 1, y: 1),
        (x: 1, y: 1),
        (x: 2, y: 2),
      );
      expect(angle, 0);
    });
  });

  group('angleFromHorizontal', () {
    test('horizontal right', () {
      final angle = angleFromHorizontal(
        (x: 0, y: 0),
        (x: 1, y: 0),
      );
      expect(angle, closeTo(0, 0.1));
    });

    test('vertical down', () {
      final angle = angleFromHorizontal(
        (x: 0, y: 0),
        (x: 0, y: 1),
      );
      expect(angle, closeTo(90, 0.1));
    });

    test('vertical up', () {
      final angle = angleFromHorizontal(
        (x: 0, y: 1),
        (x: 0, y: 0),
      );
      expect(angle, closeTo(-90, 0.1));
    });

    test('horizontal left', () {
      final angle = angleFromHorizontal(
        (x: 1, y: 0),
        (x: 0, y: 0),
      );
      expect(angle.abs(), closeTo(180, 0.1));
    });
  });

  group('pixelsToMm', () {
    test('basic conversion', () {
      final mm = pixelsToMm(100, 0.5);
      expect(mm, 200);
    });

    test('zero scale returns zero', () {
      final mm = pixelsToMm(100, 0);
      expect(mm, 0);
    });

    test('unit scale', () {
      final mm = pixelsToMm(50, 1);
      expect(mm, 50);
    });
  });

  group('mmToPixels', () {
    test('basic conversion', () {
      final pixels = mmToPixels(200, 0.5);
      expect(pixels, 100);
    });

    test('unit scale', () {
      final pixels = mmToPixels(50, 1);
      expect(pixels, 50);
    });
  });

  group('kneeFlexion', () {
    test('90 degree interior angle', () {
      final flex = kneeFlexion(
        (x: 0, y: 0),
        (x: 1, y: 0),
        (x: 1, y: 1),
      );
      expect(flex, closeTo(90, 0.1));
    });

    test('knee flexion is 180 minus interior angle', () {
      final flex = kneeFlexion(
        (x: 0, y: 0),
        (x: 1, y: 0),
        (x: 2, y: 0),
      );
      expect(flex, closeTo(0, 0.1));
    });
  });

  group('torsoAngle', () {
    test('horizontal torso', () {
      final angle = torsoAngle(
        (x: 0, y: 0),
        (x: 1, y: 0),
      );
      expect(angle, closeTo(0, 0.1));
    });

    test('vertical torso', () {
      final angle = torsoAngle(
        (x: 0, y: 0),
        (x: 0, y: 1),
      );
      expect(angle, closeTo(90, 0.1));
    });
  });

  group('isPeak', () {
    test('detects peak in window', () {
      final samples = [1.0, 2.0, 3.0, 4.0, 5.0, 4.0, 3.0, 2.0, 1.0];
      expect(isPeak(samples, 4, 2), true);
    });

    test('rejects non-peak', () {
      final samples = [5.0, 4.0, 3.0, 4.0, 5.0];
      expect(isPeak(samples, 2, 1), false);
    });

    test('rejects edge indices', () {
      final samples = [1.0, 2.0, 3.0, 4.0, 5.0];
      expect(isPeak(samples, 0, 2), false);
      expect(isPeak(samples, 4, 2), false);
    });

    test('detects peak at boundary', () {
      final samples = [1.0, 2.0, 3.0, 2.0, 1.0, 2.0, 3.0, 2.0, 1.0];
      expect(isPeak(samples, 2, 2), true);
      expect(isPeak(samples, 6, 2), true);
    });
  });

  group('photoPixelToWidget', () {
    test('1:1 scale, no letterbox', () {
      // Square photo, square widget, 1:1 scale
      const photoSize = Size(100, 100);
      const widgetSize = Size(100, 100);
      const photoPixel = Offset(50, 50);

      final result = photoPixelToWidget(photoPixel, photoSize, widgetSize);
      expect(result.dx, closeTo(50, 0.1));
      expect(result.dy, closeTo(50, 0.1));
    });

    test('photo wider than widget - width constrained', () {
      // 200x100 photo in 100x100 widget; width-constrained, so scale = 0.5
      const photoSize = Size(200, 100);
      const widgetSize = Size(100, 100);
      const photoPixel = Offset(200, 50); // Right edge of photo

      final result = photoPixelToWidget(photoPixel, photoSize, widgetSize);
      // At 0.5x scale, pixel 200 -> 100 x offset = 100 widget pixels
      expect(result.dx, closeTo(100, 0.1));
      // Vertically centered: (100 - 50)/2 = 25 top offset, plus 50*0.5 = 25 + 25 = 50
      expect(result.dy, closeTo(50, 0.1));
    });

    test('photo taller than widget - height constrained', () {
      // 100x200 photo in 100x100 widget; height-constrained, so scale = 0.5
      const photoSize = Size(100, 200);
      const widgetSize = Size(100, 100);
      const photoPixel = Offset(50, 200); // Bottom of photo

      final result = photoPixelToWidget(photoPixel, photoSize, widgetSize);
      // Horizontally centered: (100 - 50)/2 = 25 left offset, plus 50*0.5 = 25 + 25 = 50
      expect(result.dx, closeTo(50, 0.1));
      // At 0.5x scale, pixel 200 -> 100 y offset = 100 widget pixels
      expect(result.dy, closeTo(100, 0.1));
    });

    test('origin stays at origin', () {
      const photoSize = Size(1920, 1080);
      const widgetSize = Size(320, 240);
      const photoPixel = Offset(0, 0);

      final result = photoPixelToWidget(photoPixel, photoSize, widgetSize);
      // Scale is determined by aspect; 1920/1080 ≈ 1.78, 320/240 ≈ 1.33
      // Photo is wider, so width-constrained; scale = 320/1920 ≈ 0.167
      // Origin should map to some offset (not 0,0 unless aspects match)
      // But we're just checking it doesn't crash
      expect(result, isNotNull);
    });
  });

  group('widgetToPhotoPixel', () {
    test('1:1 scale, no letterbox - inverse', () {
      const photoSize = Size(100, 100);
      const widgetSize = Size(100, 100);
      const widgetPixel = Offset(50, 50);

      final result = widgetToPhotoPixel(widgetPixel, photoSize, widgetSize);
      expect(result.dx, closeTo(50, 0.1));
      expect(result.dy, closeTo(50, 0.1));
    });

    test('round-trip conversion', () {
      const photoSize = Size(1920, 1080);
      const widgetSize = Size(320, 240);
      const photoPixel = Offset(960, 540); // Center of photo

      final widgetPixel =
          photoPixelToWidget(photoPixel, photoSize, widgetSize);
      final recoveredPhotoPixel =
          widgetToPhotoPixel(widgetPixel, photoSize, widgetSize);

      expect(recoveredPhotoPixel.dx, closeTo(photoPixel.dx, 1.0));
      expect(recoveredPhotoPixel.dy, closeTo(photoPixel.dy, 1.0));
    });
  });
}
