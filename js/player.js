/**
 * Player class for MYOB Retro Runner
 * Handles player movement, physics, and collision detection
 */
class Player {
  /**
   * Initialize the player
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
    this.velocityY = 0;
    this.gravity = 0.3; // Reduced from 0.6 to create a more floaty jump
    this.jumpForce = -10; // Reduced initial force for a more gradual ascent
    this.groundY = game.canvas.height - this.height; // Adjusted to touch ground (removed the 20px gap)
    this.isJumping = false;
    this.canDoubleJump = false; // Track if player can double jump
    this.hasDoubleJumped = false; // Track if player has used double jump
    this.isAlive = true;
    this.hasPowerUp = false;
    this.isSuperPowerUp = false; // Track if player has super power-up
    this.powerUpTimer = 0;
    this.powerUpDuration = 600; // 10 seconds at 60fps

    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 20; // Attack lasts for 20 frames
    this.attackCooldown = 0;
    this.attackCooldownDuration = 30; // Cooldown period between attacks
    this.attackRange = 60; // Distance in front of player the attack reaches
    
    // New property for attack-based invincibility
    this.attackInvincibilityDuration = 15; // Frames of invincibility when attacking
    this.attackInvincibilityTimer = 0;   // Timer for tracking invincibility
    
    // Animation properties
    this.frameX = 0;
    this.frameY = 0;
    this.frameTimer = 0;
    this.frameInterval = 10; // Number of game updates before changing animation frame
    this.maxFrames = 4; // Number of animation frames
    
    // Sprite setup
    this.spriteWidth = 32; // Width of one frame in the sprite sheet
    this.spriteHeight = 48; // Height of one frame in the sprite sheet
    this.spriteLoaded = false;
    
    // Load player sprite
    this.sprite = new Image();
    this.sprite.src = 'assets/sprites/player.svg';
    this.sprite.onload = () => {
      console.log('Player sprite loaded successfully');
      this.spriteLoaded = true;
    };
    
    this.sprite.onerror = (err) => {
      console.error('Failed to load player sprite:', err);
      this.spriteLoaded = false;
    };
  }

  /**
   * Update player state
   */
  update() {
    // Handle jumping physics
    if (this.isJumping) {
      this.y += this.velocityY;
      this.velocityY += this.gravity;

      // Check if landed
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.isJumping = false;
        this.velocityY = 0;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
      }
    }

    // Update attack state if attacking
    if (this.isAttacking) {
      this.attackTimer++;
      if (this.attackTimer >= this.attackDuration) {
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackCooldown = this.attackCooldownDuration;
      }
      
      // Reset attack invincibility timer when attacking starts
      if (this.attackTimer === 1) {
        this.attackInvincibilityTimer = this.attackInvincibilityDuration;
      }
    } else if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
    
    // Update attack invincibility timer
    if (this.attackInvincibilityTimer > 0) {
      this.attackInvincibilityTimer--;
    }

    // Update power-up status if active
    if (this.hasPowerUp) {
      this.powerUpTimer++;
      if (this.powerUpTimer >= this.powerUpDuration) {
        this.deactivatePowerUp();
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
   * Check if player is currently invincible
   * This is true if the player has a power-up or is in attack invincibility frames
   * @returns {boolean} Whether player is invincible
   */
  isInvincible() {
    // Player is invincible if they have a power-up or are in attack invincibility frames
    return this.hasPowerUp || this.attackInvincibilityTimer > 0;
  }

  /**
   * Check collision with game objects
   * @param {Object} object - The object to check collision with
   * @returns {boolean} Whether collision occurred
   */
  collidesWith(object) {
    // For coins, use a larger hitbox to make collection easier
    if (object.constructor.name === "Coin") {
      // Extend the collision area for coins by 10 pixels in each direction
      const extendedHitbox = 10;
      return (
        this.x < object.x + object.width + extendedHitbox &&
        this.x + this.width + extendedHitbox > object.x &&
        this.y < object.y + object.height + extendedHitbox &&
        this.y + this.height + extendedHitbox > object.y
      );
    }

    // Normal collision detection for other objects
    return (
      this.x < object.x + object.width &&
      this.x + this.width > object.x &&
      this.y < object.y + object.height &&
      this.y + this.height > object.y
    );
  }

  /**
   * Draw the player on the canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    // Only apply special appearance if player has super power-up
    // No longer tied to score
    const hasSpecialAppearance = this.isSuperPowerUp;

    if (!this.shouldDrawSprite(ctx)) {
      this.drawFallbackShape(ctx);
      return;
    }

    // Set animation frame based on player state
    if (this.isAttacking) {
      this.frameY = 2; // Attack animation row
    } else if (this.isJumping) {
      this.frameY = 1; // Jump animation row
    } else {
      this.frameY = 0; // Run animation row
    }

    // Apply special effects based on player state
    ctx.save();

    // Special appearance for super power-up only
    if (hasSpecialAppearance) {
      // Add special glow effect - changed from red to green
      ctx.shadowColor = "#00cc44";
      ctx.shadowBlur = 15;

      // Add trail effect for super power-up
      const trailOpacity = 0.4;
      ctx.globalAlpha = trailOpacity;
      this.drawPlayerSprite(ctx, -5, 0);
      ctx.globalAlpha = 1.0;
    }
    // Standard power-up effect
    else if (this.hasPowerUp) {
      ctx.shadowColor = "#ffcc00";
      ctx.shadowBlur = 10;
    }
    // Attack invincibility effect - add a brief blue glow when player is attack-invincible
    else if (this.attackInvincibilityTimer > 0) {
      ctx.shadowColor = "#4466ff";
      ctx.shadowBlur = 8 + (this.attackInvincibilityTimer / 2);
      
      // Add a pulsing effect based on invincibility timer
      const pulseScale = 1 + (Math.sin(this.attackInvincibilityTimer * 0.5) * 0.05);
      ctx.scale(pulseScale, pulseScale);
    }

    // Try to draw the sprite
    this.drawPlayerSprite(ctx);

    ctx.restore();

    // Draw attack effect if attacking
    if (this.isAttacking) {
      this.drawAttackEffect(ctx);
    }
  }

  /**
   * Check if sprite should be drawn or fallback to simple shape
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @returns {boolean} Whether sprite should be drawn
   */
  shouldDrawSprite() {
    // Always draw sprite if possible - can be enhanced with additional checks if needed
    return true;
  }

  /**
   * Draw a simple fallback shape when sprite cannot be drawn
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawFallbackShape(ctx) {
    ctx.save();
    // Draw a simple rectangle representing the player
    ctx.fillStyle = this.hasPowerUp ? '#ffcc00' : '#3366ff';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }

  /**
   * Draw the player sprite
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} offsetX - Optional X offset for drawing effects
   * @param {number} offsetY - Optional Y offset for drawing effects
   */
  drawPlayerSprite(ctx, offsetX = 0, offsetY = 0) {
    if (this.spriteLoaded) {
      // Use the sprite sheet
      const frameWidth = 32; // Width of each frame in the sprite sheet
      const frameHeight = 48; // Height of each frame
      
      // Calculate the source rectangle from the sprite sheet
      const sourceX = this.frameX * frameWidth;
      const sourceY = this.frameY * frameHeight;
      
      // Draw the appropriate frame from the sprite sheet
      ctx.drawImage(
        this.sprite,
        sourceX, sourceY, frameWidth, frameHeight,
        this.x + offsetX, this.y + offsetY, this.width, this.height
      );
    } else {
      // Fallback to a colored rectangle if sprite isn't loaded
      ctx.fillStyle = this.isAttacking ? '#ff6600' : '#3366ff';
      ctx.fillRect(this.x + offsetX, this.y + offsetY, this.width, this.height);
    }
  }

  /**
   * Draw attack effect
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawAttackEffect(ctx) {
    ctx.save();

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    // Arc parameters
    const arcRadius = this.attackRange * 0.6; // Bring the arc closer to the body
    const arcWidth = 15; // Reduce the width for a sharper effect

    // Arc angles for a right-front facing effect
    const startAngle = -Math.PI * 0.1; // Slightly below the right
    const endAngle = Math.PI * 0.3; // Slightly above the right

    // Main plasma arc gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, arcRadius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // Bright white core
    gradient.addColorStop(0.5, 'rgba(220, 220, 255, 0.7)'); // Subtle blue-white glow
    gradient.addColorStop(1, 'rgba(180, 180, 255, 0.3)'); // Fading blue

    ctx.strokeStyle = gradient;
    ctx.lineWidth = arcWidth;
    ctx.lineCap = 'round';

    // Draw the main arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, arcRadius, startAngle, endAngle);
    ctx.stroke();

    // Add glow effect around the arc
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 30;

    ctx.restore();
  }

  /**
   * Create visual effect when player breaks through an obstacle or enemy
   * @param {number} x - X position of the effect
   * @param {number} y - Y position of the effect
   */
  createAttackEffect(x, y) {
    // This method is called when player breaks through obstacles
    // No implementation needed for now - visual effects would go here
  }

  /**
   * Make the player jump
   */
  jump() {
    // Allow jumping if on ground
    if (!this.isJumping) {
      this.isJumping = true;
      this.velocityY = this.jumpForce;
      this.canDoubleJump = true;
    } 
    // Allow double jump if in mid-air and hasn't double jumped yet
    else if (this.canDoubleJump && !this.hasDoubleJumped) {
      this.velocityY = this.jumpForce * 0.8; // Slightly weaker double jump
      this.hasDoubleJumped = true;
      this.canDoubleJump = false;
    }
    // Allow infinite jumps with super power-up
    else if (this.isSuperPowerUp) {
      this.velocityY = this.jumpForce * 0.7; // Even weaker for balance
    }
  }

  /**
   * Make the player attack
   */
  attack() {
    // Only allow attack if not on cooldown
    if (!this.isAttacking && this.attackCooldown <= 0) {
      this.isAttacking = true;
      this.attackTimer = 0;
    }
  }

  /**
   * Activate a power-up for the player
   * @param {boolean} isSuper - Whether this is a super power-up
   */
  activatePowerUp(isSuper = false) {
    this.hasPowerUp = true;
    this.isSuperPowerUp = isSuper;
    this.powerUpTimer = 0;
  }

  /**
   * Deactivate any active power-up
   */
  deactivatePowerUp() {
    this.hasPowerUp = false;
    this.isSuperPowerUp = false;
    this.powerUpTimer = 0;
  }
}

