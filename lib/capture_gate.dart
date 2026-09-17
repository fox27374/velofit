import 'package:flutter/material.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'angle_utils.dart';

/// A sample of ankle position and landmarks at a specific time.
class AnkleSample {
  final double x;
  final double y;
  final int timestampMs; // Monotonic time since capture started
  final List<PoseLandmark> landmarks;

  AnkleSample({
    required this.x,
    required this.y,
    required this.timestampMs,
    required this.landmarks,
  });
}

/// A confirmed peak at a specific time.
class PeakRecord {
  final int timestampMs; // Time of the peak sample itself
  final int sampleIndex; // Index in the ankle samples list

  PeakRecord({
    required this.timestampMs,
    required this.sampleIndex,
  });
}

/// A request to keep a pedal-forward frame.
///
/// Identified by timestamp, not by index: an extremum is only confirmed a
/// lookahead window after it happened, and the gate clears its sample history
/// on reset, so an index into that history means nothing to the caller.
class KeepFrameRequest {
  /// Timestamp of the frame to keep — the confirmed extremum, NOT the current
  /// frame, which is a lookahead window later.
  final int timestampMs;

  /// Landmarks belonging to that same frame.
  final List<PoseLandmark> landmarks;

  KeepFrameRequest({
    required this.timestampMs,
    required this.landmarks,
  });
}

/// Gate state transitions and decisions, testable without Flutter.
/// Call `processSample()` on each frame; read the state and act on decisions.
class CaptureGate {
  // Configuration
  final double pixelScale;
  final double calibrationPhotoWidth;
  final double calibrationPhotoHeight;
  final List<Offset> calibrationTaps;

  /// Width of the frames being streamed, set once the first frame arrives.
  /// Zero means "not yet known", in which case no rescale is applied.
  double streamImageWidth = 0;

  // Sample history: aligned 1:1 with samples, one per processed frame
  final List<AnkleSample> _samples = [];

  // Confirmed peaks: appended only when isPeak confirms
  final List<PeakRecord> _peakRecords = [];

  // Intervals in seconds between consecutive confirmed peaks
  final List<double> _peakIntervals = [];

  // State
  bool gateArmed = false;
  int cyclesCountedAfterArming = 0;
  int keptFrameCount = 0;
  static const int maxKeptFrames = 5;

  // Timing
  bool captureTimedOut = false;
  bool shouldReset = false;
  bool shouldPause = false;
  KeepFrameRequest? keepThisFrame; // Non-null if a frame should be kept this sample
  String? failureReason;

  // For break detection: time of last confirmed peak
  int? _lastPeakTimestampMs;

  // For X-extremum detection: whether a frame was kept for this cycle
  bool _frameKeptThisCycle = false;

  // Pedal-forward direction
  late bool _pedalForwardIsMaxX;

  CaptureGate({
    required this.pixelScale,
    required this.calibrationPhotoWidth,
    required this.calibrationPhotoHeight,
    required this.calibrationTaps,
  }) {
    _pedalForwardIsMaxX = isPedalForwardMaxX(calibrationTaps);
  }

  /// Process one ankle sample. Call once per processed frame.
  void processSample(
    AnkleSample sample, {
    required int timeoutMs,
  }) {
    // Check timeout
    if (sample.timestampMs > timeoutMs) {
      captureTimedOut = true;
      failureReason = gateArmed
          ? 'Timeout: no more pedaling. Try again.'
          : 'No steady pedaling detected. Try again.';
      return;
    }

    // Add to sample history
    _samples.add(sample);

    // Reset state for this frame
    keepThisFrame = null;
    shouldReset = false;
    shouldPause = false;

    // Check for Y-peak (bottom of stroke)
    const peakWindow = 3;
    if (_samples.length > peakWindow * 2) {
      final yPeakIndex = _samples.length - 1 - peakWindow;
      final yValues = _samples.map((s) => s.y).toList();

      if (isPeak(yValues, yPeakIndex, peakWindow)) {
        _handlePeakConfirmed(yPeakIndex);
      }
    }

    // Check for X-extremum (pedal forward) on every frame when armed
    if (gateArmed && _samples.length > 3) {
      const xPeakWindow = 3;
      final xIndex = _samples.length - 1 - xPeakWindow;
      if (xIndex >= xPeakWindow) {
        final xValues = _samples.map((s) => s.x).toList();
        final isXExtrema = _checkXExtrema(xValues, xIndex, xPeakWindow);

        if (isXExtrema && !_frameKeptThisCycle && keptFrameCount < maxKeptFrames) {
          // The extremum is at xIndex, a lookahead window back. Hand over THAT
          // frame's identity and landmarks; `sample` is the current frame and
          // its knee has already moved on, which is the coordinate KOPS
          // measures.
          final extremum = _samples[xIndex];
          keepThisFrame = KeepFrameRequest(
            timestampMs: extremum.timestampMs,
            landmarks: extremum.landmarks,
          );
          keptFrameCount++;
          _frameKeptThisCycle = true;
        }
      }
    }

    // Check for >3 second gap (time-based, evaluated every frame)
    if (gateArmed && _lastPeakTimestampMs != null) {
      final gapMs = sample.timestampMs - _lastPeakTimestampMs!;
      if (gapMs > 3000) {
        shouldReset = true;
        _resetGate();
      }
    }
  }

  void _handlePeakConfirmed(int yPeakIndex) {
    final peakSample = _samples[yPeakIndex];
    final peakRecord = PeakRecord(
      timestampMs: peakSample.timestampMs,
      sampleIndex: yPeakIndex,
    );

    // Compute interval from last peak
    if (_peakRecords.isNotEmpty) {
      final lastPeak = _peakRecords.last;
      final intervalMs = peakRecord.timestampMs - lastPeak.timestampMs;
      final intervalSeconds = intervalMs / 1000.0;
      _peakIntervals.add(intervalSeconds);

      // Check gate arming
      if (!gateArmed && _peakIntervals.length >= intervalsBeforeArming) {
        final recentIntervals =
            _peakIntervals.sublist(_peakIntervals.length - intervalsBeforeArming);
        if (areIntervalsValid(recentIntervals, 0)) {
          // Check ankle vertical travel
          if (_checkAnkleVerticalTravel()) {
            gateArmed = true;
          }
        }
      }

      // If gate is armed, check interval validity
      if (gateArmed) {
        if (!areIntervalsValid([intervalSeconds], 0)) {
          // Irregular interval: pause but keep state
          shouldPause = true;
          _lastPeakTimestampMs = peakRecord.timestampMs;
          _peakRecords.add(peakRecord);
          return;
        }

        // Valid cycle
        cyclesCountedAfterArming++;
        _frameKeptThisCycle = false; // Reset for next cycle
      }

      // If not armed, check consistency
      if (!gateArmed && _peakIntervals.length >= intervalsBeforeArming) {
        final recentIntervals =
            _peakIntervals.sublist(_peakIntervals.length - intervalsBeforeArming);
        if (!areIntervalsValid(recentIntervals, 0)) {
          // Reset
          shouldReset = true;
          _resetGate();
          return;
        }
      }
    }

    _lastPeakTimestampMs = peakRecord.timestampMs;
    _peakRecords.add(peakRecord);
  }

  bool _checkAnkleVerticalTravel() {
    if (_samples.length < 50) return false;
    final recent = _samples.sublist((_samples.length - 50).clamp(0, _samples.length));
    final yValues = recent.map((s) => s.y).toList();
    // Stream pixels are not calibration-photo pixels, and pixelScale is in the
    // latter. Same aspect ratio is requested for both, so a width ratio is the
    // whole correction.
    final streamToCalibration =
        streamImageWidth > 0 ? calibrationPhotoWidth / streamImageWidth : 1.0;
    final verticalTravelPixels =
        ankleVerticalTravelPixels(yValues) * streamToCalibration;
    final verticalTravelMm = pixelsToMm(verticalTravelPixels, pixelScale);
    return verticalTravelMm >= minAnkleVerticalTravelMm;
  }

  bool _checkXExtrema(List<double> xValues, int index, int window) {
    if (index < window || index >= xValues.length - window) {
      return false;
    }

    final val = xValues[index];

    if (_pedalForwardIsMaxX) {
      // Check if it's a maximum
      for (int i = index - window; i <= index + window; i++) {
        if (i != index && xValues[i] > val) {
          return false;
        }
      }
      return true;
    } else {
      // Check if it's a minimum
      for (int i = index - window; i <= index + window; i++) {
        if (i != index && xValues[i] < val) {
          return false;
        }
      }
      return true;
    }
  }

  void _resetGate() {
    gateArmed = false;
    cyclesCountedAfterArming = 0;
    keptFrameCount = 0;
    _samples.clear();
    _peakRecords.clear();
    _peakIntervals.clear();
    _lastPeakTimestampMs = null;
    _frameKeptThisCycle = false;
  }

  bool isCaptureComplete() {
    return keptFrameCount >= maxKeptFrames;
  }

  bool hasRider() {
    return _samples.isNotEmpty;
  }

  double getAverageCadenceRpm() {
    if (_peakIntervals.isEmpty) return 0;
    final avgInterval = _peakIntervals.reduce((a, b) => a + b) / _peakIntervals.length;
    return avgInterval > 0 ? 60.0 / avgInterval : 0;
  }
}
