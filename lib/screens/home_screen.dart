import 'package:flutter/material.dart';
import '../fit_targets.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('VeloFit')),
      body: ListView(
        children: [
          ListTile(
            leading: const Icon(Icons.directions_bike),
            title: const Text('Bike Fitting'),
            subtitle: const Text('Measure angles from a pedaling video'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.of(context).pushNamed('/setup'),
          ),
          ListTile(
            leading: const Icon(Icons.help_outline),
            title: const Text('How to Measure'),
            subtitle: const Text('Phone placement, distance and framing'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.of(context).pushNamed('/how_to'),
          ),
          ListTile(
            leading: const Icon(Icons.table_chart),
            title: const Text('Fitting Tables'),
            subtitle: const Text('Target ranges used for scoring'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.of(context).pushNamed('/tables'),
          ),
        ],
      ),
    );
  }
}

class FitTablesScreen extends StatelessWidget {
  const FitTablesScreen({super.key});

  static const _rows = [
    ('Knee flexion (bottom of stroke)', FitTargets.kneeFlexionMin, FitTargets.kneeFlexionMax),
    ('Hip angle', FitTargets.hipAngleMin, FitTargets.hipAngleMax),
    ('Torso angle (from horizontal)', FitTargets.torsoAngleMin, FitTargets.torsoAngleMax),
    ('Elbow angle', FitTargets.elbowAngleMin, FitTargets.elbowAngleMax),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Fitting Tables')),
      body: ListView(
        children: [
          for (final (label, min, max) in _rows)
            ListTile(
              title: Text(label),
              trailing: Text('${min.toStringAsFixed(0)}–${max.toStringAsFixed(0)}°'),
            ),
        ],
      ),
    );
  }
}
