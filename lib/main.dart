import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/how_to_screen.dart';
import 'screens/setup_screen.dart';
import 'screens/calibration_screen.dart';
import 'screens/pedaling_screen.dart';
import 'screens/bike_point_screen.dart';
import 'screens/results_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VeloFit',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case '/setup':
            return MaterialPageRoute(builder: (context) => const SetupScreen());
          case '/how_to':
            return MaterialPageRoute(builder: (context) => const HowToScreen());
          case '/tables':
            return MaterialPageRoute(builder: (context) => const FitTablesScreen());
          case '/calibration':
            final args = settings.arguments as Map<String, dynamic>?;
            return MaterialPageRoute(
              builder: (context) => CalibrationScreen(
                wheelDiameter: args?['wheelDiameter'] ?? 700,
              ),
            );
          case '/pedaling':
            final args = settings.arguments as Map<String, dynamic>? ?? {};
            return MaterialPageRoute(
              builder: (context) => PedalingScreen(
                wheelDiameter: args['wheelDiameter'] ?? 700,
                pixelScale: args['pixelScale'] ?? 1,
                calibrationImage: args['calibrationImage'] ?? '',
                calibrationPhotoWidth: args['calibrationPhotoWidth'] ?? 0,
                calibrationPhotoHeight: args['calibrationPhotoHeight'] ?? 0,
                calibrationTaps: args['calibrationTaps'] ?? [],
                bbPoint: args['bbPoint'] ?? const Offset(0, 0),
                saddlePoint: args['saddlePoint'] ?? const Offset(0, 0),
              ),
            );
          case '/bike_point':
            final args = settings.arguments as Map<String, dynamic>? ?? {};
            return MaterialPageRoute(
              builder: (context) => BikePointScreen(
                wheelDiameter: args['wheelDiameter'] ?? 700,
                pixelScale: args['pixelScale'] ?? 1,
                pedalForwardImage: args['pedalForwardImage'] ?? '',
                medianKneeX: args['medianKneeX'] ?? 0,
                kneeXSpreadMm: args['kneeXSpreadMm'] ?? 0,
                calibrationPhotoWidth: args['calibrationPhotoWidth'] ?? 0,
                calibrationPhotoHeight: args['calibrationPhotoHeight'] ?? 0,
                streamImageWidth: args['streamImageWidth'] ?? 0,
                streamImageHeight: args['streamImageHeight'] ?? 0,
                bbPoint: args['bbPoint'] ?? const Offset(0, 0),
                saddlePoint: args['saddlePoint'] ?? const Offset(0, 0),
                kneeFlexion: args['kneeFlexion'] ?? 0,
                hipAngle: args['hipAngle'] ?? 0,
                torsoAngle: args['torsoAngle'] ?? 0,
                elbowAngle: args['elbowAngle'] ?? 0,
                pedalForwardKneeLandmark: args['pedalForwardKneeLandmark'],
              ),
            );
          case '/results':
            final args = settings.arguments as Map<String, dynamic>? ?? {};
            return MaterialPageRoute(
              builder: (context) => ResultsScreen(
                wheelDiameter: args['wheelDiameter'] ?? 700,
                pixelScale: args['pixelScale'] ?? 1,
                kneeFlexion: args['kneeFlexion'] ?? 0,
                hipAngle: args['hipAngle'] ?? 0,
                torsoAngle: args['torsoAngle'] ?? 0,
                elbowAngle: args['elbowAngle'] ?? 0,
                kopsOffset: args['kopsOffset'] ?? 0,
                saddleHeight: args['saddleHeight'] ?? 0,
                kneeXSpreadMm: args['kneeXSpreadMm'],
                calibrationPhotoWidth: args['calibrationPhotoWidth'] ?? 0,
                calibrationPhotoHeight: args['calibrationPhotoHeight'] ?? 0,
                streamImageWidth: args['streamImageWidth'] ?? 0,
                streamImageHeight: args['streamImageHeight'] ?? 0,
              ),
            );
          default:
            return null;
        }
      },
    );
  }
}
