/**
 * Obstacle class for MYOB Retro Runner
 * Handles obstacle generation, movement, and collision
 */
class Obstacle {
    /**
     * Initialize an obstacle
     * @param {Object} game - Reference to the main game object
     * @param {number} speed - Speed of the obstacle
     */
    constructor(game, speed) {
        this.game = game;
        this.x = game.canvas.width;
        
        // Improved obstacle placement with more at the bottom and consistent sizes
        const groundPosition = game.canvas.height - 50;
        const heightVariation = 100;
        const heightValue = Math.random();
        
        // Make 70% of obstacles appear at ground level with consistent size
        if (heightValue < 0.7) {
            // Ground level obstacles - require timing to jump over
            this.y = groundPosition - (heightVariation * 0.1);
            this.height = 40; // Increased height for better visibility
            this.width = 40;  // Increased width for better visibility
        } else if (heightValue < 0.85) {
            // Medium obstacles - less frequent
            this.y = groundPosition - (heightVariation * 0.5);
            this.height = 40; // Increased height
            this.width = 40;  // Increased width
        } else {
            // High obstacles - rare
            this.y = groundPosition - (heightVariation * 0.8);
            this.height = 40; // Increased height
            this.width = 40;  // Increased width
        }
        
        this.speed = speed;
        this.markedForDeletion = false;
        
        // Sprite properties
        this.spriteImg = new Image();
        this.spriteImg.src = 'assets/sprites/obstacles.svg'; // Use SVG instead of PNG
        this.spriteLoaded = false;
        
        // Add error handling for sprite loading
        this.spriteImg.onload = () => {
            this.spriteLoaded = true;
            console.log('Obstacle sprite loaded successfully');
        };
        
        this.spriteImg.onerror = () => {
            console.warn('Failed to load obstacle sprite image. Using fallback.');
            this.spriteLoaded = false;
        };
        
        // Randomly select one of the four obstacle types
        this.obstacleType = Math.floor(Math.random() * 4);
        
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrames = 2; // Number of animation frames
        this.frameTimer = 0;
        this.frameInterval = 10; // Update animation every 10 frames
        
        // Add pulsating effect for enhanced visibility
        this.pulseValue = 0;
        this.pulseDirection = 1;
    }

    /**
     * Update obstacle position
     */
    update() {
        this.x -= this.speed;
        
        // Mark for deletion if off screen
        if (this.x + this.width < 0) {
            this.markedForDeletion = true;
        }
        
        // Animate sprite
        this.frameTimer++;
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = (this.frameX + 1) % this.maxFrames;
        }
        
        // Update pulsating effect
        this.pulseValue += 0.05 * this.pulseDirection;
        if (this.pulseValue >= 1) {
            this.pulseValue = 1;
            this.pulseDirection = -1;
        } else if (this.pulseValue <= 0) {
            this.pulseValue = 0;
            this.pulseDirection = 1;
        }
    }

    /**
     * Draw the obstacle on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        ctx.save(); // Save current canvas state
        
        // Add a subtle glow effect around the obstacle
        const glowSize = 10 + (this.pulseValue * 5);
        ctx.shadowColor = 'rgba(255, 0, 0, 0.7)';
        ctx.shadowBlur = glowSize;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        if (this.shouldDrawSprite()) {
            try {
                // Draw sprite frame
                const frameWidth = 32; // Width of one frame in spritesheet
                const frameHeight = 32; // Height of one frame in spritesheet
                
                ctx.drawImage(
                    this.spriteImg,
                    this.obstacleType * frameWidth, // Use the randomly selected obstacle type
                    0, // No vertical frames, all obstacles are in a row
                    frameWidth, 
                    frameHeight,
                    this.x, 
                    this.y, 
                    this.width, 
                    this.height
                );
            } catch (error) {
                console.warn('Error drawing obstacle sprite:', error);
                this.drawFallbackShape(ctx);
            }
        } else {
            this.drawFallbackShape(ctx);
        }
        
        ctx.restore(); // Restore canvas state
    }
    
    /**
     * Check if the sprite should be drawn
     * @returns {boolean} Whether to draw the sprite
     */
    shouldDrawSprite() {
        return this.spriteLoaded && this.spriteImg.complete;
    }
    
    /**
     * Draw fallback shape when sprite can't be drawn
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawFallbackShape(ctx) {
        // Vibrant fallback shape with gradient if sprite not loaded
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(1, '#ff6600');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add a border for better visibility
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}