import 'dart:math';

import 'package:flutter_test/flutter_test.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'package:velofit/capture_gate.dart';

/// Drives [CaptureGate] with a synthesised pedaling signal.
///
/// The ankle traces a circle: y peaks at the bottom of the stroke, x peaks a
/// quarter turn away. Every bug found in review so far has been a condition
/// evaluated at an index where it cannot hold, which unit tests of the pure
/// helpers cannot see — only pushing a realistic signal through the whole
/// state machine catches them.

const double _fps = 30;
const double _pixelScale = 1.0; // 1 px per mm, so pixels read as millimetres
const double _amplitudeMm = 100; // 200mm of ankle travel, over the 150mm floor

/// Calibration taps with the front wheel to the RIGHT of the bottom bracket,
/// which is the documented filming setup, so pedal-forward is maximum x.
final _tapsWheelRight = <Offset>[
  const Offset(800, 100), // wheel top
  const Offset(800, 500), // wheel bottom
  const Offset(400, 400), // bottom bracket
  const Offset(380, 150), // saddle top
];

List<PoseLandmark> _landmarksAt(double kneeX, double kneeY) => [
      PoseLandmark(
        type: PoseLandmarkType.leftKnee,
        x: kneeX,
        y: kneeY,
        z: 0,
        likelihood: 0.9,
      ),
      PoseLandmark(
        type: PoseLandmarkType.leftAnkle,
        x: kneeX,
        y: kneeY + 100,
        z: 0,
        likelihood: 0.9,
      ),
    ];

/// One sample of steady pedaling at [rpm], [i] frames in.
AnkleSample _pedalSample(int i, {required double rpm}) {
  final t = i / _fps;
  final phase = 2 * pi * (rpm / 60) * t;
  // y grows downward, so bottom of stroke is maximum y.
  final y = 500 + _amplitudeMm * cos(phase);
  final x = 600 + _amplitudeMm * sin(phase);
  return AnkleSample(
    x: x,
    y: y,
    timestampMs: (t * 1000).round(),
    landmarks: _landmarksAt(x, y - 100),
  );
}

CaptureGate _newGate({List<Offset>? taps}) => CaptureGate(
      pixelScale: _pixelScale,
      calibrationPhotoWidth: 1280,
      calibrationPhotoHeight: 720,
      calibrationTaps: taps ?? _tapsWheelRight,
    );

void main() {
  group('CaptureGate on a synthesised pedaling signal', () {
    test('arms, counts cycles and keeps five pedal-forward frames', () {
      final gate = _newGate();
      final kept = <int>[];

      // 12 seconds at 80rpm is 16 revolutions — plenty to arm and finish.
      for (var i = 0; i < _fps * 12; i++) {
        if (gate.isCaptureComplete()) break;
        gate.processSample(_pedalSample(i, rpm: 80), timeoutMs: 60000);
        final request = gate.keepThisFrame;
        if (request != null) kept.add(request.timestampMs);
      }

      expect(gate.gateArmed, isTrue, reason: 'steady pedaling must arm the gate');
      expect(gate.cyclesCountedAfterArming, greaterThanOrEqualTo(5));
      expect(gate.keptFrameCount, 5);
      expect(kept.length, 5, reason: 'one kept frame per counted cycle');
      expect(gate.isCaptureComplete(), isTrue);
    });

    test('kept frames sit at the pedal-forward instant, not bottom of stroke',
        () {
      final gate = _newGate();
      final keptPhases = <double>[];

      for (var i = 0; i < _fps * 12; i++) {
        if (gate.isCaptureComplete()) break;
        final sample = _pedalSample(i, rpm: 80);
        gate.processSample(sample, timeoutMs: 60000);
        final request = gate.keepThisFrame;
        if (request != null) {
          // The request names the frame by timestamp, so the phase of the
          // frame actually kept is recoverable exactly.
          final t = request.timestampMs / 1000.0;
          keptPhases.add(2 * pi * (80 / 60) * t);
        }
      }

      expect(keptPhases, isNotEmpty);
      for (final phase in keptPhases) {
        final x = sin(phase); // +1 at pedal-forward
        final y = cos(phase); // +1 at bottom of stroke
        expect(x, greaterThan(0.85),
            reason: 'kept frame should be at maximum ankle-x');
        expect(y.abs(), lessThan(0.5),
            reason: 'kept frame must not be at the bottom of the stroke');
      }
    });

    test('the kept frame carries landmarks from the frame being kept', () {
      final gate = _newGate();

      for (var i = 0; i < _fps * 12; i++) {
        if (gate.isCaptureComplete()) break;
        final sample = _pedalSample(i, rpm: 80);
        gate.processSample(sample, timeoutMs: 60000);
        final request = gate.keepThisFrame;
        if (request != null) {
          // The landmarks must come from the confirmed extremum, not from the
          // current frame, which is a lookahead window later and has a
          // visibly different knee x — the coordinate KOPS measures.
          final expectedFrame = (request.timestampMs / 1000.0 * _fps).round();
          final keptSample = _pedalSample(expectedFrame, rpm: 80);
          expect(request.landmarks.first.x,
              closeTo(keptSample.landmarks.first.x, 0.001),
              reason: 'landmarks must belong to the kept frame');
          expect(request.landmarks.first.x, isNot(closeTo(sample.x, 0.001)),
              reason: 'and not to the current frame');
        }
      }
    });

    test('mounting the bike does not arm the gate', () {
      final gate = _newGate();
      final random = Random(7);

      // Irregular, large ankle movements: steps and weight shifts, with no
      // consistent period. This is what scored five cycles on the device.
      var t = 0.0;
      for (var i = 0; i < 200; i++) {
        t += 0.05 + random.nextDouble() * 0.45;
        gate.processSample(
          AnkleSample(
            x: 600 + random.nextDouble() * 200,
            y: 500 + random.nextDouble() * 200,
            timestampMs: (t * 1000).round(),
            landmarks: _landmarksAt(600, 400),
          ),
          timeoutMs: 60000,
        );
      }

      expect(gate.gateArmed, isFalse,
          reason: 'irregular movement must never arm the gate');
      expect(gate.keptFrameCount, 0);
    });

    test('cadence is reported from the signal', () {
      final gate = _newGate();
      for (var i = 0; i < _fps * 8; i++) {
        if (gate.isCaptureComplete()) break;
        gate.processSample(_pedalSample(i, rpm: 80), timeoutMs: 60000);
      }
      expect(gate.getAverageCadenceRpm(), closeTo(80, 8));
    });

    test('pedal-forward follows the calibration taps when the bike is mirrored',
        () {
      // Front wheel LEFT of the bottom bracket: pedal-forward becomes minimum x.
      final mirrored = <Offset>[
        const Offset(200, 100),
        const Offset(200, 500),
        const Offset(600, 400),
        const Offset(620, 150),
      ];
      final gate = _newGate(taps: mirrored);
      final keptPhases = <double>[];

      for (var i = 0; i < _fps * 12; i++) {
        if (gate.isCaptureComplete()) break;
        gate.processSample(_pedalSample(i, rpm: 80), timeoutMs: 60000);
        final request = gate.keepThisFrame;
        if (request != null) {
          final t = request.timestampMs / 1000.0;
          keptPhases.add(2 * pi * (80 / 60) * t);
        }
      }

      expect(keptPhases, isNotEmpty);
      for (final phase in keptPhases) {
        expect(sin(phase), lessThan(-0.85),
            reason: 'mirrored setup must keep frames at minimum ankle-x');
      }
    });
  });
}
