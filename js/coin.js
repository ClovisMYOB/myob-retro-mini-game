/**
 * Coin class for MYOB Retro Runner
 * Handles coin generation, movement, and collection
 */
class Coin {
    /**
     * Initialize a coin
     * @param {Object} game - Reference to the main game object
     * @param {number} speed - Speed of the coin
     */
    constructor(game, speed) {
        this.game = game;
        this.x = game.canvas.width;
        
        // Determine coin size randomly
        this.size = this.determineSize();
        this.value = this.determineValue(); // Set point value based on size
        
        // Set coin dimensions based on size
        this.width = this.size;
        this.height = this.size;
        
        // Improve coin placement to be more accessible and reduce ground level coins
        const groundPosition = game.canvas.height - 20;
        const heightValue = Math.random();
        
        // Get player's vertical center position for better coin placement
        const playerY = this.game.player.y;
        const playerHeight = this.game.player.height;
        const playerCenterY = playerY + (playerHeight / 2) - (this.height / 2);
        
        // Create different placement patterns for coins with less emphasis on ground level
        if (heightValue < 0.15) { // Reduced from 0.3 to 0.15 (50% fewer ground coins)
            // Ground level coins - easy to collect while running
            this.y = groundPosition - 30;
        } else if (heightValue < 0.4) { // Increased from 0.5
            // Player level coins - aligns with player's center position
            this.y = playerCenterY;
        } else if (heightValue < 0.65) { // Increased from 0.7
            // Low/mid level coins - collectible during small jumps
            this.y = groundPosition - 80 - (Math.random() * 40);
        } else if (heightValue < 0.9) { // Kept the same
            // Higher coins - collectible during higher jumps
            this.y = groundPosition - 120 - (Math.random() * 40);
        } else {
            // Some coins still at challenging heights (rare)
            this.y = groundPosition - 180 - (Math.random() * 30);
        }
        
        this.speed = speed;
        this.markedForDeletion = false;
        
        // Sprite properties
        this.spriteImg = new Image();
        this.spriteImg.src = 'assets/sprites/coin.svg';
        this.spriteLoaded = false;
        
        // Add error handling for sprite loading
        this.spriteImg.onload = () => {
            this.spriteLoaded = true;
            console.log('Coin sprite loaded successfully');
        };
        
        this.spriteImg.onerror = () => {
            console.warn('Failed to load coin sprite image. Using fallback.');
            this.spriteLoaded = false;
        };
        
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrames = 6; // Number of animation frames
        this.frameTimer = 0;
        this.frameInterval = 5; // Update animation every 5 frames
    }

    /**
     * Determine the size of the coin
     * @returns {number} Size of the coin in pixels
     */
    determineSize() {
        const sizeRoll = Math.random();
        
        // Small coins are most common (60%)
        if (sizeRoll < 0.6) {
            return 16; // Small coin
        } 
        // Medium coins are less common (30%)
        else if (sizeRoll < 0.9) {
            return 24; // Medium coin
        } 
        // Large coins are rare (10%)
        else {
            return 32; // Large coin
        }
    }
    
    /**
     * Determine the value of the coin based on its size
     * @returns {number} Point value of the coin
     */
    determineValue() {
        // Small coin = 1 point, Medium coin = 2 points, Large coin = 3 points
        if (this.size === 16) {
            return 1;
        } else if (this.size === 24) {
            return 2;
        } else {
            return 3;
        }
    }

    /**
     * Update coin position
     */
    update() {
        this.x -= this.speed;
        
        // Coin attraction when player has power-up
        if (this.game.player.hasPowerUp) {
            const player = this.game.player;
            const attractionRange = 250; // How far the power-up attracts coins
            const distanceX = player.x - this.x;
            const distanceY = player.y - this.y;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            // If coin is within attraction range, move it toward player
            if (distance < attractionRange) {
                // Calculate attraction force (stronger when closer)
                const attractionForce = (1 - distance / attractionRange) * 5;
                
                // Move coin toward player
                this.x += (distanceX / distance) * attractionForce;
                this.y += (distanceY / distance) * attractionForce;
            }
        }
        
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
    }

    /**
     * Draw the coin on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (this.shouldDrawSprite()) {
            try {
                // Base frame size in spritesheet
                const frameWidth = 20; // Width of one frame in spritesheet
                const frameHeight = 20; // Height of one frame in spritesheet
                
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
                
                // Debug: Show coin value (optional - remove in production)
                // ctx.fillStyle = '#ffffff';
                // ctx.font = '12px Arial';
                // ctx.fillText(this.value.toString(), this.x + this.width/2, this.y - 5);
            } catch (error) {
                console.warn('Error drawing coin sprite:', error);
                this.drawFallbackShape(ctx);
            }
        } else {
            this.drawFallbackShape(ctx);
        }
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
        // Color based on coin value
        if (this.value === 1) {
            ctx.fillStyle = '#ffcc00'; // Gold for small coin
        } else if (this.value === 2) {
            ctx.fillStyle = '#ffdd33'; // Brighter gold for medium coin
        } else {
            ctx.fillStyle = '#ffe666'; // Brightest gold for large coin
        }
        
        // Fallback circle if sprite not loaded
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
    }
}