/**
 * Main game class for MYOB Retro Runner
 * Handles game initialization, loop, and state management
 */
class Game {
    /**
     * Initialize the game
     */
    constructor() {
        // Setup canvas
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        // Game state
        this.isRunning = false;
        this.gameOver = false;
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        
        // Performance tracking
        this.fps = 60;
        this.lastTime = 0;
        this.frameTime = 0;
        this.frameCount = 0;
        
        // Game objects
        this.player = new Player(this, 80, this.canvas.height - 48); // Updated y-position for proper ground contact
        this.spawnManager = new SpawnManager(this);
        this.powerUpManager = new PowerUpManager(this);
        this.enemies = [];
        this.spawnEnemy();
        
        // Background
        this.backgroundImg = new Image();
        
        // Add error handling for background loading
        this.backgroundImg.onload = () => {
            console.log('Background image loaded successfully');
            // Force a redraw of the static screen once the image is loaded
            this.drawStatic();
        };
        
        this.backgroundImg.onerror = () => {
            console.warn('Failed to load background image. Retrying with another path...');
            // Try loading with a fallback path or retry the same path
            setTimeout(() => {
                this.backgroundImg.src = 'assets/sprites/background.svg?v=' + new Date().getTime();
            }, 1000);
        };
        
        // Set the source after defining the event handlers
        this.backgroundImg.src = 'assets/sprites/background.svg'; // Changed from .png to .svg
        
        this.backgroundX = 0;
        this.backgroundSpeed = 2;
        
        // Input handling
        this.setupInputHandlers();
        
        // UI elements
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.finalScoreElement = document.getElementById('final-score');
        this.startButton = document.getElementById('start-button');
        this.restartButton = document.getElementById('restart-button');
        this.gameOverScreen = document.getElementById('game-over');
        
        // Setup UI
        this.setupUI();
        
        // Initial display
        this.updateScoreDisplay();
        this.drawStatic();
    }

    /**
     * Setup input handlers
     */
    setupInputHandlers() {
        // Keyboard input for jumping and attacking
        window.addEventListener('keydown', (e) => {
            // Jump with Space or ArrowUp
            if ((e.code === 'Space' || e.code === 'ArrowUp') && this.isRunning) {
                this.player.jump();
                e.preventDefault(); // Prevent page scrolling
            }
            
            // Attack with Shift or ArrowRight
            if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'ArrowRight') && this.isRunning) {
                this.player.attack();
                e.preventDefault();
            }
            
            // Restart with Enter key when game over
            if (e.code === 'Enter' && this.gameOver) {
                this.hideGameOver();
                this.restart();
                e.preventDefault();
            }
        });
        
        // Touch input for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            if (this.isRunning) {
                // Simple touch control - left side jumps, right side attacks
                const touchX = e.touches[0].clientX;
                const canvasMiddle = this.canvas.width / 2;
                
                if (touchX < canvasMiddle) {
                    // Left side touch - jump
                    this.player.jump();
                } else {
                    // Right side touch - attack
                    this.player.attack();
                }
                
                e.preventDefault();
            }
        });
    }

    /**
     * Setup UI elements
     */
    setupUI() {
        // Start button
        this.startButton.addEventListener('click', () => {
            this.start();
        });
        
        // Restart button
        this.restartButton.addEventListener('click', () => {
            // Hide the game over popup if it's visible
            this.hideGameOver();
            this.restart();
        });
        
        // Game over restart button
        document.getElementById('restart-game').addEventListener('click', () => {
            this.hideGameOver();
            this.restart();
        });
    }

    /**
     * Start the game
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameOver = false;
            this.startButton.style.display = 'none';
            this.restartButton.style.display = 'inline-block';
            this.gameLoop(0);
        }
    }

    /**
     * Restart the game
     */
    restart() {
        // Reset game state
        this.score = 0;
        this.updateScoreDisplay();
        
        // Reset game objects
        this.player = new Player(this, 80, this.canvas.height - 48); // Updated y-position for proper ground contact
        this.spawnManager.reset();
        this.powerUpManager.reset();
        
        // Reset enemies
        this.enemies = [];
        this.spawnEnemy();
        
        // Start game
        this.isRunning = true;
        this.gameOver = false;
        this.lastTime = 0;
    }

    /**
     * Main game loop
     * @param {number} timestamp - Current time from requestAnimationFrame
     */
    gameLoop(timestamp) {
        // Calculate delta time and FPS
        if (this.lastTime === 0) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Update FPS counter every second
        this.frameTime += deltaTime;
        this.frameCount++;
        if (this.frameTime >= 1000) {
            this.fps = this.frameCount;
            this.frameTime = 0;
            this.frameCount = 0;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw and scroll background
        this.drawBackground();
        
        // Update game objects
        if (this.isRunning && !this.gameOver) {
            this.update();
            this.draw();
            
            // Check for collisions
            this.checkCollisions();
            
            // Check for power-up availability
            if (this.powerUpManager.checkPowerUpAvailability(this.score)) {
                this.powerUpManager.activatePowerUp();
            }
        }
        
        // Continue game loop if game is still running
        if (this.isRunning) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    /**
     * Update game state
     */
    update() {
        this.player.update();
        this.spawnManager.update();
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update());
        
        // Check if we need to spawn more enemies based on score
        if (this.score > 0 && this.score % 200 === 0 && this.enemies.length < 3) {
            this.spawnEnemy();
        }
        
        // Remove enemies that are marked for deletion
        const previousLength = this.enemies.length;
        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
        
        // Debug log for enemy removal (will help track if enemies are being removed)
        if (previousLength !== this.enemies.length) {
            console.log(`Removed enemy. Count: ${this.enemies.length}`);
        }
        
        // Ensure there's always at least one enemy in the game
        if (this.enemies.length === 0) {
            this.spawnEnemy();
        }
    }

    /**
     * Draw game objects
     */
    draw() {
        // Draw ground
        this.drawGround();
        
        // Draw game objects
        this.player.draw(this.ctx);
        this.spawnManager.draw(this.ctx);
        
        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
    }

    /**
     * Draw background with parallax scrolling
     */
    drawBackground() {
        // Scroll background
        this.backgroundX -= this.backgroundSpeed;
        if (this.backgroundX <= -this.canvas.width) {
            this.backgroundX = 0;
        }
        
        // Check if the image is loaded and complete before drawing
        if (this.backgroundImg.complete && this.backgroundImg.naturalHeight !== 0) {
            // Draw background twice for seamless scrolling
            this.ctx.drawImage(
                this.backgroundImg, 
                this.backgroundX, 
                0, 
                this.canvas.width, 
                this.canvas.height
            );
            this.ctx.drawImage(
                this.backgroundImg, 
                this.backgroundX + this.canvas.width, 
                0, 
                this.canvas.width, 
                this.canvas.height
            );
        } else {
            // Temporary solid color background until image loads
            this.ctx.fillStyle = '#000033';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * Draw ground
     */
    drawGround() {
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);
    }

    /**
     * Draw static elements when game is not running
     */
    drawStatic() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        this.drawGround();
        
        // Create a semi-transparent black background for instructions
        const instructionsX = this.canvas.width / 2 - 380;
        const instructionsY = this.canvas.height / 2 - 170;
        const instructionsWidth = 750;
        const instructionsHeight = 330;
        
        // Draw the semi-transparent background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(instructionsX, instructionsY, instructionsWidth, instructionsHeight);
        
        // Add a border to the background
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(instructionsX, instructionsY, instructionsWidth, instructionsHeight);
        
        this.ctx.fillStyle = '#4b0082'; // Dark purple color for consistency
        this.ctx.textAlign = 'center';
        
        // Draw expanded instructions with more details
        this.ctx.font = '18px "Courier New", Courier, monospace';
        this.ctx.fillStyle = '#ffffff'; // White text for better contrast on dark background
        this.ctx.fillText('Press SPACE or UP ARROW to jump', this.canvas.width / 2, this.canvas.height / 2 - 130);
        this.ctx.fillText('Press SPACE while in mid-air to double jump!', this.canvas.width / 2, this.canvas.height / 2 - 1055);
        this.ctx.fillText('Press SHIFT or RIGHT ARROW to attack', this.canvas.width / 2, this.canvas.height / 2 - 80);
        
        // Add the new attack invincibility instruction with blue color to match the visual effect
        this.ctx.fillStyle = '#4466ff';
        this.ctx.fillText('Attacking gives brief invincibility - time it right to smash!', this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        // Back to regular white text for general instructions
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Collect coins and smash obstacles & enemies to score', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        // Add powerup explanations
        this.ctx.fillStyle = '#ffcc00'; // Gold color for powerup text
        this.ctx.fillText('Every 20 points: Regular powerup - Temporary invincibility', this.canvas.width / 2, this.canvas.height / 2 + 80);
        this.ctx.fillStyle = '#ff3333'; // Red color for super powerup text
        this.ctx.fillText('Every 100 points: Super powerup - Invincibility + infinite jumps!', this.canvas.width / 2, this.canvas.height / 2 + 105);
        
        // Add enter key instruction
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Press ENTER to restart when game over', this.canvas.width / 2, this.canvas.height / 2 + 135);
    }

    /**
     * Check for collisions
     */
    checkCollisions() {
        this.checkObstacleCollisions();
        this.checkEnemyCollisions();
        this.checkCoinCollisions();
    }

    checkObstacleCollisions() {
        for (const obstacle of this.spawnManager.obstacles) {
            if (this.player.collidesWith(obstacle)) {
                if (this.player.isInvincible()) {
                    obstacle.markedForDeletion = true;
                    const pointValue = this.player.attackInvincibilityTimer > 0 && !this.player.hasPowerUp ? 2 : 1;
                    this.addScore(pointValue);
                    if (this.player.attackInvincibilityTimer > 0) {
                        this.player.createAttackEffect(obstacle.x, obstacle.y);
                    }
                } else {
                    this.endGame();
                    break;
                }
            }
        }
    }

    checkEnemyCollisions() {
        for (const enemy of this.enemies) {
            if (this.player.collidesWith(enemy)) {
                if (this.player.isInvincible()) {
                    enemy.reset(this.canvas.width + 500);
                    const pointValue = this.player.attackInvincibilityTimer > 0 && !this.player.hasPowerUp ? 5 : 2;
                    this.addScore(pointValue);
                    if (this.player.attackInvincibilityTimer > 0) {
                        this.player.createAttackEffect(enemy.x, enemy.y);
                    }
                } else {
                    this.endGame();
                    break;
                }
            }
        }
    }

    checkCoinCollisions() {
        for (const coin of this.spawnManager.coins) {
            if (this.player.collidesWith(coin)) {
                coin.markedForDeletion = true;
                this.addScore(coin.value);
            }
        }
    }

    /**
     * Add to score
     * @param {number} points - Points to add
     */
    addScore(points) {
        this.score += points;
        this.updateScoreDisplay();
        
        // Update high score if needed
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            this.updateScoreDisplay();
        }
    }

    /**
     * Spawn a new enemy
     */
    spawnEnemy() {
        // Ensure enemies spawn far enough away from the player
        const minSpawnDistance = 500; // Minimum distance from right edge 
        const x = this.canvas.width + minSpawnDistance + Math.random() * 300;
        
        // Ensure this enemy doesn't spawn too close to obstacles
        const noObstaclesNearby = !this.spawnManager.obstacles.some(obstacle => 
            Math.abs(obstacle.x - x) < 350
        );
        
        // Only spawn if there's enough space
        if (noObstaclesNearby) {
            const enemy = new Enemy(this, x, this.canvas.height - 48); // Updated y-position to touch ground
            this.enemies.push(enemy);
        } else {
            // Try again later if there's not enough space
            setTimeout(() => this.spawnEnemy(), 1000);
        }
    }

    /**
     * Update score display
     */
    updateScoreDisplay() {
        this.scoreElement.textContent = this.score;
        this.highScoreElement.textContent = this.highScore;
    }

    /**
     * End the game
     */
    endGame() {
        this.gameOver = true;
        this.finalScoreElement.textContent = this.score;
        this.showGameOver();
    }

    /**
     * Show game over screen
     */
    showGameOver() {
        this.gameOverScreen.style.display = 'block';
    }

    /**
     * Hide game over screen
     */
    hideGameOver() {
        this.gameOverScreen.style.display = 'none';
        // Show the restart button again when the game over popup is hidden
        if (this.isRunning) {
            this.restartButton.style.display = 'inline-block';
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // Expose game for debugging
    window.game = game;
});