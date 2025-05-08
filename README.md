# MYOB Retro Runner

MYOB Retro Runner is a fast-paced, retro-style 2D endless runner game. Players control a character to jump, attack, and collect coins while avoiding obstacles and enemies. The game features power-ups, high scores, and a nostalgic pixel-art aesthetic.

## Play Now
Play the game online: [MYOB Retro Runner](https://clovismyob.github.io/myob-retro-mini-game/)

## Features
- **Endless Gameplay**: Run as far as you can while avoiding obstacles and enemies.
- **Power-Ups**: Collect coins to activate temporary invincibility and super abilities.
- **High Scores**: Compete with yourself to achieve the highest score.
- **Responsive Controls**: Supports both keyboard and touch input for desktop and mobile devices.
- **Retro Aesthetic**: Pixelated graphics and animations inspired by classic arcade games.

## Getting Started

### Prerequisites
- A modern web browser (e.g., Chrome, Firefox, Edge).
- A local web server for running the game (e.g., [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)).

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/myob-retro-mini-game.git
   ```
2. Navigate to the project directory:
   ```bash
   cd myob-retro-mini-game
   ```
3. Open the project in your code editor (e.g., VS Code).

### Running the Game
1. Start a local web server (e.g., using Live Server in VS Code).
2. Open `index.html` in your browser.
3. Click the "Start Game" button to begin playing.

## Controls
- **Jump**: Press `Space` or `Arrow Up`. Double-tap for a double jump.
- **Attack**: Press `Shift` or `Arrow Right` to attack enemies and obstacles.
- **Restart**: Press `Enter` when the game is over.

## Folder Structure
```
myob-retro-mini-game/
├── index.html          # Main HTML file
├── css/                # Stylesheets
│   └── style.css       # Main CSS file
├── js/                 # JavaScript files
│   ├── game.js         # Main game logic
│   ├── player.js       # Player class
│   ├── enemy.js        # Enemy class
│   ├── coin.js         # Coin class
│   ├── obstacle.js     # Obstacle class
│   ├── powerups.js     # Power-up manager
│   └── spawn-manager.js# Spawn manager
├── assets/             # Game assets (sprites, fonts, etc.)
├── tests/              # Unit tests
└── README.md           # Project documentation
```

## Running Browser-Based Tests

The project includes browser-based tests located in the `tests/canvas_browser_and_functionality_tests.js` file. These tests are automatically executed when you open the `index.html` file in your browser. The tests validate the functionality of various game components, including canvas rendering and game logic.

To run the browser-based tests:
1. Open `index.html` in your browser.
2. Check the browser console (usually accessible via `F12` or `Ctrl+Shift+I`/`Cmd+Option+I`) for test results and any error messages.

Ensure that your browser supports JavaScript modules, as the tests are written as ES6 modules.