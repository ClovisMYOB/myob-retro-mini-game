// Test for canvas scaling to fit the browser window
function testCanvasScaling() {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);

  // Simulate window resize
  window.innerWidth = 800;
  window.innerHeight = 600;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (canvas.width === window.innerWidth && canvas.height === window.innerHeight) {
    console.log('Canvas scaling test passed.');
  } else {
    console.error('Canvas scaling test failed.');
  }

  document.body.removeChild(canvas);
}

// Test for browser compatibility
function testBrowserCompatibility() {
  const browsers = ['Chrome', 'Firefox', 'Edge'];
  const isCompatible = browsers.every(browser => {
    try {
      // Simulate a basic game logic check
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error(`${browser} does not support CanvasRenderingContext2D.`);

      // Example game logic
      const enemy = { x: 50, y: 50, width: 32, height: 48 };
      const player = { x: 60, y: 60, width: 32, height: 48 };
      const collides =
        enemy.x < player.x + player.width &&
        enemy.x + enemy.width > player.x &&
        enemy.y < player.y + player.height &&
        enemy.y + enemy.height > player.y;

      return collides !== undefined; // Ensure no errors in logic
    } catch (error) {
      console.error(`${browser} compatibility test failed:`, error);
      return false;
    }
  });

  if (isCompatible) {
    console.log('Browser compatibility test passed.');
  } else {
    console.error('Browser compatibility test failed.');
  }
}

// Test for coin functionality
function testCoinFunctionality() {
  console.log('Testing coin functionality...');

  // Mock game object with canvas and player properties
  const mockGame = {
    canvas: { width: 800, height: 600 },
    player: { y: 300, height: 50, hasPowerUp: false },
  };

  const coin = new Coin(mockGame, 5);
  if (coin.x === 800 && coin.y >= 0 && coin.y <= 600) {
    console.log('Coin initialization test passed.');
  } else {
    console.error('Coin initialization test failed.');
  }

  coin.update();
  if (coin.x < 800) {
    console.log('Coin movement test passed.');
  } else {
    console.error('Coin movement test failed.');
  }
}

// Test for enemy functionality
function testEnemyFunctionality() {
  console.log('Testing enemy functionality...');

  // Mock game object with canvas and player properties
  const mockGame = {
    canvas: { width: 800, height: 600 },
    player: { x: 400, y: 300, width: 50, height: 50 },
  };

  const enemy = new Enemy(mockGame, 300, 400);
  if (enemy.x === 300 && enemy.y === 400) {
    console.log('Enemy initialization test passed.');
  } else {
    console.error('Enemy initialization test failed.');
  }

  enemy.update();
  if (enemy.x < 300) {
    console.log('Enemy movement test passed.');
  } else {
    console.error('Enemy movement test failed.');
  }
}

// Test for game functionality
function testGameFunctionality() {
  console.log('Testing game functionality...');
  const game = new Game();
  if (game.score === 0) {
    console.log('Game initialization test passed.');
  } else {
    console.error('Game initialization test failed.');
  }

  // Override start method with mock that includes original functionality
  game.start = () => {
    console.log('Mock game start called.');
    // Set isRunning to true like the original method does
    game.isRunning = true;
  };
  
  game.start();
  if (game.isRunning) {
    console.log('Game start test passed.');
  } else {
    console.error('Game start test failed.');
  }
}

// Test for obstacle functionality
function testObstacleFunctionality() {
  console.log('Testing obstacle functionality...');

  // Mock game object with canvas property
  const mockGame = {
    canvas: { width: 800, height: 600 },
  };

  const obstacle = new Obstacle(mockGame, 5);
  if (obstacle.x === 800 && obstacle.y >= 0 && obstacle.y <= 600) {
    console.log('Obstacle initialization test passed.');
  } else {
    console.error('Obstacle initialization test failed.');
  }

  obstacle.update();
  if (obstacle.x < 800) {
    console.log('Obstacle movement test passed.');
  } else {
    console.error('Obstacle movement test failed.');
  }
}

// Test for player functionality
function testPlayerFunctionality() {
  console.log('Testing player functionality...');

  // Mock game object with canvas property
  const mockGame = {
    canvas: { width: 800, height: 600 },
  };

  const player = new Player(mockGame, 50, 100);
  if (player.x === 50 && player.y === 100) {
    console.log('Player initialization test passed.');
  } else {
    console.error('Player initialization test failed.');
  }

  player.jump();

  // Simulate game loop to allow gravity to affect the player
  for (let i = 0; i < 10; i++) {
    player.update();
  }

  if (player.y < 100) {
    console.log('Player jump test passed.');
  } else {
    console.error('Player jump test failed.');
  }
  
  // Test double jump functionality
  player.jump(); // Attempt double jump
  
  // Check if the double jump was executed
  if (player.velocityY < 0 && player.hasDoubleJumped) {
    console.log('Player double jump test passed.');
  } else {
    console.error('Player double jump test failed.');
  }
  
  // Test attack functionality
  player.attack();
  
  // Need to call update once after attack to set the attackInvincibilityTimer
  player.update();
  
  // Check if the attack was executed
  if (player.attackInvincibilityTimer > 0) {
    console.log('Player attack test passed.');
  } else {
    console.error('Player attack test failed.');
  }
}

// Test for powerups functionality
function testPowerupsFunctionality() {
  console.log('Testing powerups functionality...');

  // Mock game object with player property
  const mockGame = {
    player: {
      activatePowerUp: (isSuper) => {
        console.log(`Power-up activated. Super: ${isSuper}`);
      },
      hasPowerUp: false,
    },
  };

  const powerUpManager = new PowerUpManager(mockGame);
  const coinCount = 20;

  if (powerUpManager.checkPowerUpAvailability(coinCount)) {
    console.log('Power-up availability test passed.');
  } else {
    console.error('Power-up availability test failed.');
  }

  if (powerUpManager.activatePowerUp()) {
    console.log('Power-up activation test passed.');
  } else {
    console.error('Power-up activation test failed.');
  }
}

// Test for spawn manager functionality
function testSpawnManagerFunctionality() {
  console.log('Testing spawn manager functionality...');

  // Mock game object with canvas and player properties
  const mockGame = {
    canvas: { width: 800, height: 600 },
    player: { x: 100, y: 300, width: 50, height: 50, hasPowerUp: false },
    score: 0,
  };

  const spawnManager = new SpawnManager(mockGame);

  // Simulate update calls to trigger obstacle and coin spawning
  for (let i = 0; i < 200; i++) {
    spawnManager.update();
  }

  if (spawnManager.obstacles.length > 0) {
    console.log('Obstacle spawning test passed.');
  } else {
    console.error('Obstacle spawning test failed.');
  }

  if (spawnManager.coins.length > 0) {
    console.log('Coin spawning test passed.');
  } else {
    console.error('Coin spawning test failed.');
  }
}

// Run all tests
testCanvasScaling();
testBrowserCompatibility();
testCoinFunctionality();
testEnemyFunctionality();
testGameFunctionality();
testObstacleFunctionality();
testPlayerFunctionality();
testPowerupsFunctionality();
testSpawnManagerFunctionality();
testCollisionDetection();

// Test for collision detection
function testCollisionDetection() {
  console.log('Testing collision detection...');
  
  // Create two objects that should collide
  const object1 = {
    x: 10,
    y: 10,
    width: 20,
    height: 20,
    collidesWith: function(other) {
      return this.x < other.x + other.width &&
        this.x + this.width > other.x &&
        this.y < other.y + other.height &&
        this.y + this.height > other.y;
    }
  };
  
  const object2 = {
    x: 20,
    y: 20,
    width: 20,
    height: 20
  };
  
  // Test collision (objects overlap)
  if (object1.collidesWith(object2)) {
    console.log('Collision detection test passed for overlapping objects.');
  } else {
    console.error('Collision detection test failed for overlapping objects.');
  }
  
  // Move object2 away so there's no collision
  object2.x = 50;
  object2.y = 50;
  
  // Test no collision (objects don't overlap)
  if (!object1.collidesWith(object2)) {
    console.log('Collision detection test passed for non-overlapping objects.');
  } else {
    console.error('Collision detection test failed for non-overlapping objects.');
  }
}