
HelioClock ☀️🌙🪐

HelioClock is a high-precision, real-time astronomical situation-awareness dashboard and orbital simulator. Designed explicitly to bridge pure planetary physics with your true wall-clock experience, the application operates with zero platform dependencies, running at a fluid 60 FPS on mobile and desktop platforms alike.
Optimized for dynamic global tracking via real-time hardware sensor inputs, HelioClock calculates the timezone offset dynamically based on real-time GPS location coordinates and the device's native system clock. This dynamically handles variable offsets, enabling precise local tracking (including permanent or active regional Daylight Saving Time changes) automatically without hardcoding any values, synchronizing active hardware sensors with global celestial mechanics to map out the cosmic dance directly over your local horizon.

🚀 Core Features


1. Daylight Core & Solar Ephemeris Graph

• Dynamic GPS Ephemeris & Timezone Calibration: Calculates solar arcs and timezone offsets dynamically based on active mobile or desktop GPS coordinates and the device's native system clock. Automatically handles variable offsets and regional Daylight Saving Time changes without fixed local parameters, accurately rendering the full year's solar noon curve, day lengths, and ephemeris transitions for any location worldwide.
• Daylight Delta: Displays a real-time, day-over-day rate of change indicator (e.g., tracking the rapid -3m 34s loss of daylight during seasonal transitions).
• Option B Interactive Date-Scrubbing: Drag the vertical "Today" indicator line horizontally across the 365-day calendar line chart to dynamically warp the entire application's date parameters across past, present, or future configurations.
• Astronomical Milestones: Subtle, high-contrast markers plotting the exact calendar positions for the Summer Solstice, Winter Solstice, Vernal Equinox, and Autumnal Equinox with detailed hover tooltips.

2. World Astronomical Solar Map

• Multi-Projection Switching: Toggle instantly between three highly optimized rendering structures:
	• Equal Earth: A physically accurate, modern oval projection maintaining relative global area proportions.
	• Spherical Earth: A gorgeous, fully rotational 3D globe representing the physical planet from space.
	• Mercator: The classic rectangular matrix grid.
• Two-Axis Interactive Dragging: Scroll longitudes horizontally across all views, and tilt latitudes vertically on the Equal Earth and 3D Spherical views to dynamically change your anchor coordinate anywhere on Earth.
• Atmospheric Shading Integrity: Stripped of artificial city dots, a crisp multi-stop transparent gradient rolls naturally from 100% unshaded daylight directly through the Civil, Nautical, and Astronomical twilight zones into deep navy night.

3. Sky Observatory & Planisphere Dome

• Dual View Projection: Instantly switch between an Equirectangular grid map and a circular Local Polar Projection (Planisphere) mapping your true horizon (0° Altitude) to local Zenith (90° overhead), dynamically adapted to your active global GPS position.
• Clutter-Free Trajectory Tracking: Dotted trajectory lines are strictly limited to the Sun (orange arc) and Moon (white arc) above the horizon line to prevent the "spaghetti effect".
• High-Density Azimuth Radial Scale: The perimeter features ultra-fine, lightweight 10-degree tick marks accompanied by subtle 8px degree numbers, providing a professional marine compass aesthetic whose compass ring calibrations adapt dynamically to your device's global coordinates.
• Interactive Feature Checklist: Discrete header-level toggles allow you to dynamically strip away Paths, Stars, Planets, or Grid Lines on the fly to customize information density.
• Canvas Typography Fixes: Star and planet labels scale to an elegant, un-bolded 9px on desktop layouts with built-in horizontal/vertical collision offset spacing to ensure dense stellar groupings (like Orion or Ursa Major) never overlap.

4. Top-Down Heliocentric Orrery

• Dual-Scale Scaling: Includes distinct sub-toggles to focus tightly on the compact Inner Planets or stretch outwards to map the gas giants via Outer Planets (ending at Neptune).
• Heliocentric Alignment Vector: Projects a thin, crisp ray of light directly from the Sun through the Earth, extending into a micro-pointer that dynamically adapts to the user's active mobile or desktop GPS longitude baseline globally.
• Orbital Header Metrics: Live readouts computing the active Earth-Sun distance in Astronomical Units (AU) alongside the precise Equation of Time (EoT) drift variance.
• Conjunction Alert Engine: Monitors the angular spacing of the inner worlds, flashing a quiet alert flag beneath the title the moment planetary coordinates form a linear alignment with the Sun.

5. Massive Lunar Status Module

• Photographic Terrain Texture: Overlays a high-definition photographic texture displaying true surface craters, maria, and topographical highlights.
• Position Angle Limb Tilt: Calculates the exact visual position angle of the Moon's bright limb based on active mobile or desktop GPS coordinates globally and your time-travel slider position, physically rotating the canvas so the lunar tilt matches what you see outside your window.
• Synodic Age Track: Tracks exact elapsed time from the last New Moon down to the day, hour, and minute alongside highly granular illumination percentages.

📱 Mobile Optimization & Responsive Architecture

• Responsive Sizing Overrides: On viewport widths below 600px, all core axis numbers, charts, and interface text dynamically expand to a bold, crisp 14px layout to combat high-density smartphone screens.
• Isolated Fullscreen System: Eliminating the bulky wrapping layout of the AI Studio development playground, every major panel features an independent, uniform two diagonal arrows button. Tapping it calls the native HTML5 Fullscreen API on that component container alone, forcing it to stretch 100% edge-to-edge horizontally and vertically with zero padding or margins.
• Orientation Awareness: Rotating your device into landscape mode automatically shifts components into an adapted two-column layout, ensuring text fields and WebGL elements resize cleanly without running into layout boundaries.

🛠️ Code Structure & Tech Stack

├── index.html         # Main dashboard layout wrapper and structural shells
├── css/
│   └── main.css       # Responsive stylesheets, layout queries, theme definitions
└── js/
    ├── app.js         # Shared global state manager (Live Track, coordinates, inputs)
    ├── ephemeris.js   # Keplerian elements, solar noon vectors, and astronomical data math
    ├── canvas_maps.js # WebGL/2D shaders handling multi-projection world maps & transitions
    ├── canvas_sky.js  # Planisphere coordinate drawing loop, 9px styling, collision offsets
    └── canvas_moon.js # Photographic lunar texture matrix and bright limb tilt math
• Core Stack: Vanilla HTML5, CSS3, native Canvas API / WebGL, and JavaScript (ES6+).
• Zero Dependencies: Built entirely without clunky libraries or external packages, ensuring lightweight execution, absolute reliability, and easy native packaging via tools like Capacitor or Apache Cordova into a true standalone .apk app binary.

🔧 Installation & Deployment


To run locally:

1. Clone the repository: git clone https://github.com
2. Open index.html directly in any modern desktop or mobile web browser.

To push over-the-air via developer environments:

1. If modifying inside a sandboxed wrapper or AI development console, ensure the global getCanvasFont() hooks and coordinate listener matrices are left intact.
2. Hit Publish/Republish to update your over-the-air app package shortcut on your Android launcher drawer.

📜 License

Independent Build – Crafted completely as a high-density, open-source solar situational command module. Feel free to fork, expand, or recalibrate for your own home meridian grid!
If you want, tell me if you'd like to add any specific repository links, project descriptions, or author credits before uploading this to your profile. I can tailor the document layout exactly to your needs.
