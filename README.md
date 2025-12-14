# 🎂 Joy's Birthday Celebration Platform

A complete Angular-based birthday celebration platform featuring three distinct interactive experiences: balloon physics simulation, Minecraft-style letter scroll, and CS:GO weapon combat system. All unified by a beautiful pixelated art aesthetic.

## 🚀 Quick Start

### Start Development Server
```bash
ng serve --port 4201
```

Once the server is running, open your browser and navigate to `http://localhost:4201/`.

### Access the Application
- **Birthday Home**: http://localhost:4201/
- **Letter Scroll**: http://localhost:4201/next-page
- **CSGO Weapons**: http://localhost:4201/final-page

## ✨ Features

### 🎈 Page 1: Birthday Home (Balloon Physics)
- 29 numbered interactive balloons
- Realistic physics simulation with collision detection
- Pop mechanics with shockwave effects
- Conservation of momentum
- 60 FPS animation loop

### 📜 Page 2: Letter Scroll (Minecraft Theme)
- Old parchment with burn marks effect
- Privacy-safe externalized letter content
- Pixelated character (black hoodie, trimmed beard)
- Interactive heart button navigation
- Scrollable letter container

### 🎯 Page 3: CSGO Weapons (Combat Simulation)
- 12 authentic CS:GO weapons
- Scrollable weapon inventory
- Target with health system
- Hit zone detection (head/body/legs)
- Weapon-specific mechanics (shooting/slashing/exploding)
- Headshot detection with ghost applause
- Dynamic dialogue system

## 📚 Complete Documentation

- **[QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)** - How to use the platform
- **[FINAL_PROJECT_SUMMARY.md](./FINAL_PROJECT_SUMMARY.md)** - Complete project overview
- **[BIRTHDAY_DOCS.md](./BIRTHDAY_DOCS.md)** - Balloon physics system
- **[CSGO_PAGE_DOCS.md](./CSGO_PAGE_DOCS.md)** - CSGO page technical docs
- **[PRIVACY_README.md](./PRIVACY_README.md)** - Letter privacy guide
- **[FEATURES_COMPLETE.md](./FEATURES_COMPLETE.md)** - Feature implementation list
- **[PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md)** - Initial completion notes

## 🎮 How to Play

1. **Pop Balloons**: Click on floating balloons and watch physics in action
2. **Read Letter**: Click balloon #29 to read the personalized letter
3. **Combat Mode**: Click the heart to enter CSGO combat simulation
4. **Try Weapons**: Select weapons and click target to attack
5. **Get Headshots**: Aim for the head for special ghost applause effect!

## 🛠️ Technology Stack

- **Framework**: Angular 19+ (Standalone Components)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Pure CSS with Pixelated Aesthetic
- **Physics**: Custom Physics Engine Service
- **Routing**: Lazy Loading
- **SSR**: Full Server-Side Rendering Support

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
