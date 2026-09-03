import 'package:flutter/material.dart';

/// Capture instructions. The numbers here follow the fixed capture convention
/// the whole pipeline assumes: bike on a trainer, non-drive (left) side to the
/// camera, front wheel on the right of frame, phone never moved between the
/// calibration photo and the pedaling capture.
class HowToScreen extends StatelessWidget {
  const HowToScreen({super.key});

  static const _steps = [
    (
      Icons.straighten,
      'Distance: 2.5–3 m',
      'Stand the phone 2.5–3 m to the side of the bike, far enough that the '
          'whole bike and rider fit in frame with a little room to spare. '
          'Closer than 2 m and perspective distortion skews the angles; much '
          'further and the joints get too small to place accurately.',
    ),
    (
      Icons.height,
      'Height: crank height',
      'Put the lens at bottom-bracket height — roughly 30–45 cm off the floor '
          'once the bike is in the trainer. Vertical offset from the joint '
          'being measured is what creates parallax error, and knee flexion is '
          'the primary measurement, so the crank is the point to line up with.',
    ),
    (
      Icons.crop_rotate,
      'Angle: square to the bike, no tilt',
      'The lens must point straight at the bike, 90° to its centreline, with '
          'the phone level — no tilting up or down, no rotating it to "fit '
          'everything in". An off-square camera shortens the limb lengths it '
          'sees and every angle comes out wrong.',
    ),
    (
      Icons.directions_bike,
      'Framing: left side, wheel to the right',
      'Film the non-drive (left) side of the bike, with the front wheel on the '
          'right-hand side of the frame. The app uses that direction to tell '
          'the pedal-forward point of the stroke from the pedal-back one.',
    ),
    (
      Icons.lock,
      "Don't move the phone after calibration",
      'The scale is measured from the wheel in the calibration photo and '
          'reused for every millimetre figure afterwards. Moving, zooming or '
          'even nudging the phone between the calibration photo and the '
          'pedaling capture invalidates it. Use a tripod or a solid ledge — '
          'not your hand.',
    ),
    (
      Icons.checkroom,
      'Rider and lighting',
      'Close-fitting clothing so hip and knee are visible, even light with no '
          'strong backlight, and a plain background if you have one. Ride at a '
          'steady, normal cadence and look ahead, not at the phone.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('How to Measure')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final (icon, title, body) in _steps) ...[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(icon, size: 28),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 4),
                      Text(body),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ],
      ),
    );
  }
}
