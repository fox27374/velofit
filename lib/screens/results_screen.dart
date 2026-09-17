import 'package:flutter/material.dart';
import '../angle_utils.dart';
import '../fit_targets.dart';

class ResultsScreen extends StatefulWidget {
  final double wheelDiameter;
  final double pixelScale;
  final double kneeFlexion;
  final double hipAngle;
  final double torsoAngle;
  final double elbowAngle;
  final double kopsOffset;
  final double saddleHeight;
  final double? kneeXSpreadMm;
  final double calibrationPhotoWidth;
  final double calibrationPhotoHeight;
  final double streamImageWidth;
  final double streamImageHeight;

  const ResultsScreen({
    super.key,
    required this.wheelDiameter,
    required this.pixelScale,
    required this.kneeFlexion,
    required this.hipAngle,
    required this.torsoAngle,
    required this.elbowAngle,
    required this.kopsOffset,
    required this.saddleHeight,
    this.kneeXSpreadMm,
    required this.calibrationPhotoWidth,
    required this.calibrationPhotoHeight,
    required this.streamImageWidth,
    required this.streamImageHeight,
  });

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  // Angles are passed directly from BikePointScreen (already averaged)
  late double _kneeFlexion;
  late double _hipAngle;
  late double _torsoAngle;
  late double _elbowAngle;

  @override
  void initState() {
    super.initState();
    _kneeFlexion = widget.kneeFlexion;
    _hipAngle = widget.hipAngle;
    _torsoAngle = widget.torsoAngle;
    _elbowAngle = widget.elbowAngle;
  }

  Color _getColor(double value, double min, double max) {
    if (FitTargets.isGood(value, min, max)) return Colors.green;
    if (FitTargets.isWarning(value, min, max)) return Colors.amber;
    return Colors.red;
  }

  /// A card for a value that was never measured. Showing 0° here would read
  /// as a real (and alarming) result.
  Widget _buildUnavailable(String label) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Not measured',
              style: TextStyle(fontSize: 24, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMeasurement(String label, double value, double min, double max) {
    if (value.isNaN) return _buildUnavailable(label);
    final color = _getColor(value, min, max);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              '${value.toStringAsFixed(1)}°',
              style: TextStyle(fontSize: 24, color: color, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text('Target: $min–$max°', style: const TextStyle(fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _buildMeasurementMM(String label, double value) {
    if (value.isNaN) return _buildUnavailable(label);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              '${value.toStringAsFixed(1)} mm',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  String? _checkAspectRatioProblem() {
    if (widget.calibrationPhotoWidth == 0 ||
        widget.calibrationPhotoHeight == 0 ||
        widget.streamImageWidth == 0 ||
        widget.streamImageHeight == 0) {
      return null; // Dimensions not available
    }

    final calibAspect =
        widget.calibrationPhotoWidth / widget.calibrationPhotoHeight;
    final streamAspect = widget.streamImageWidth / widget.streamImageHeight;
    final aspectRatio = streamAspect / calibAspect;

    // Allow ±5% tolerance
    if (aspectRatio < 0.95 || aspectRatio > 1.05) {
      return 'Camera aspect ratio differs from calibration photo. Results may be scaled incorrectly.';
    }
    return null;
  }

  /// Plausibility warnings, shown above the numbers so an obviously broken
  /// capture is not read as a fit.
  List<Widget> _buildWarnings() {
    final problems = measurementProblems(
      kneeFlexion: _kneeFlexion,
      hipAngle: _hipAngle,
      torsoAngle: _torsoAngle,
      elbowAngle: _elbowAngle,
      kopsOffsetMm: widget.kopsOffset,
      saddleHeightMm: widget.saddleHeight,
      kneeXSpreadMm: widget.kneeXSpreadMm,
    );

    // Add aspect ratio warning if applicable
    final aspectRatioProblem = _checkAspectRatioProblem();
    if (aspectRatioProblem != null) {
      problems.add(aspectRatioProblem);
    }

    if (problems.isEmpty) return const [];

    return [
      Card(
        color: Colors.red.shade50,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.warning_amber, color: Colors.red),
                  const SizedBox(width: 8),
                  Text(
                    'Recapture recommended',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.red.shade900,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              for (final problem in problems)
                Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Text('\u2022 $problem'),
                ),
            ],
          ),
        ),
      ),
      const SizedBox(height: 12),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bike Fit Results')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ..._buildWarnings(),
          _buildMeasurement('Knee Flexion', _kneeFlexion,
              FitTargets.kneeFlexionMin, FitTargets.kneeFlexionMax),
          const SizedBox(height: 12),
          _buildMeasurement('Hip Angle', _hipAngle, FitTargets.hipAngleMin,
              FitTargets.hipAngleMax),
          const SizedBox(height: 12),
          _buildMeasurement('Torso Angle', _torsoAngle,
              FitTargets.torsoAngleMin, FitTargets.torsoAngleMax),
          const SizedBox(height: 12),
          _buildMeasurement('Elbow Angle', _elbowAngle,
              FitTargets.elbowAngleMin, FitTargets.elbowAngleMax),
          const SizedBox(height: 12),
          _buildMeasurementMM('KOPS Offset', widget.kopsOffset),
          const SizedBox(height: 12),
          _buildMeasurementMM('Saddle Height', widget.saddleHeight),
        ],
      ),
    );
  }
}
