/**
 * Enemy class for MYOB Retro Runner
 * Handles tax man enemy movement, behavior, and collision detection
 */
class Enemy {
  /**
   * Initialize the enemy
   * @param {Object} game - Reference to the main game object
   * @param {number} x - Starting x position
   * @param {number} y - Starting y position
   */
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 48;
    this.velocityX = -3; // Moving left
    this.velocityY = 0;
    this.gravity = 0.6;
    this.groundY = game.canvas.height - this.height; // Adjusted to touch ground (removed the 20px gap)
    this.isActive = true;
    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 120; // 2 seconds at 60fps
    this.attackCooldown = 0;
    this.attackCooldownDuration = 180; // 3 seconds cooldown
    this.markedForDeletion = false; // Add property to mark for deletion

    // SVG sprite
    this.spriteImg = new Image();
    this.spriteImg.src = "assets/sprites/enemy.svg"; // Tax man sprite
    this.spriteLoaded = false;

    // Add error handling for sprite loading
    this.spriteImg.onload = () => {
      this.spriteLoaded = true;
      console.log("Enemy sprite loaded successfully");
    };

    this.spriteImg.onerror = () => {
      console.warn("Failed to load enemy sprite image. Using fallback.");
      this.spriteLoaded = false;
    };

    this.frameX = 0;
    this.frameY = 0;
    this.maxFrames = 4; // Number of animation frames
    this.frameTimer = 0;
    this.frameInterval = 6; // Update animation every 6 frames
  }

  /**
   * Update enemy state
   */
  update() {
    // Always apply movement, even when attacking (reduced speed when attacking)
    if (this.isAttacking) {
      this.x += this.velocityX * 0.8; // Slower movement during attack
    } else {
      this.x += this.velocityX;
    }

    // Mark for deletion if off screen, regardless of attack state
    if (this.x + this.width < -10) {
      // Ensure enemy is properly off-screen with some buffer
      this.markedForDeletion = true;
      return; // Skip further processing for enemies marked for deletion
    }

    // Apply gravity if not on ground
    if (this.y < this.groundY) {
      this.velocityY += this.gravity;
      this.y += this.velocityY;

      // Check if landed
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.velocityY = 0;
      }
    }

    // Handle attack state
    if (this.isAttacking) {
      this.attackTimer++;
      if (this.attackTimer >= this.attackDuration) {
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackCooldown = this.attackCooldownDuration;
      }
    } else if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }

    // Check if should attack when near player
    if (!this.isAttacking && this.attackCooldown === 0) {
      const player = this.game.player;
      const distanceToPlayer = player.x - this.x;
      if (distanceToPlayer > -200) {
        this.attack();
      }
    }

    // Animate sprite
    this.frameTimer++;
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      this.frameX = (this.frameX + 1) % this.maxFrames;
    }
  }

  /**
   * Start attack sequence
   */
  attack() {
    this.isAttacking = true;
    this.attackTimer = 0;
    this.frameX = 0; // Reset animation frame
    this.frameY = 1; // Attack animation row
  }

  /**
   * Draw the enemy on the canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    if (!this.shouldDrawSprite(ctx)) {
      this.drawFallbackShape(ctx);
      return;
    }

    // Set animation frame row
    this.frameY = this.isAttacking ? 1 : 0;

    // Try to draw the sprite
    this.drawEnemySprite(ctx);
  }

  /**
   * Check if the sprite should be drawn
   * @returns {boolean} Whether to draw the sprite
   */
  shouldDrawSprite() {
    return this.spriteLoaded && this.spriteImg.complete;
  }

  /**
   * Draw the enemy sprite
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawEnemySprite(ctx) {
    try {
      // Each frame in our sprite sheet is 32px wide and 48px tall
      const frameWidth = 32;
      const frameHeight = 48;

      ctx.drawImage(
        this.spriteImg,
        this.frameX * frameWidth,
        this.frameY * frameHeight,
        frameWidth,
        frameHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } catch (error) {
      console.warn("Error drawing enemy sprite:", error);
      this.drawFallbackShape(ctx);
    }
  }

  /**
   * Draw fallback rectangle when sprite can't be drawn
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawFallbackShape(ctx) {
    // Use black for the tax man enemy
    ctx.fillStyle = this.isAttacking ? "#990000" : "#222222";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  /**
   * Check collision with player or other game objects
   * @param {Object} object - The object to check collision with
   * @returns {boolean} Whether collision occurred
   */
  collidesWith(object) {
    return (
      this.x < object.x + object.width &&
      this.x + this.width > object.x &&
      this.y < object.y + object.height &&
      this.y + this.height > object.y
    );
  }

  /**
   * Reset enemy state
   * @param {number} x - New x position
   * @param {number} y - New y position
   */
  reset(x, y) {
    this.x = x || this.game.canvas.width + Math.random() * 300;
    this.y = y || this.groundY;
    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackCooldown = 0;
    this.markedForDeletion = false;
  }
}
