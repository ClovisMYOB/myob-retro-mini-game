/**
 * SpawnManager class for MYOB Retro Runner
 * Manages obstacle and coin spawning
 */
class SpawnManager {
    /**
     * Initialize the obstacle manager
     * @param {Object} game - Reference to the main game object
     */
    constructor(game) {
        this.game = game;
        this.obstacles = [];
        this.coins = [];
        this.obstacleTimer = 0;
        this.coinTimer = 0;
        this.obstacleInterval = 100; // Initial spawn rate
        this.coinInterval = 80; // Initial spawn rate
        this.baseSpeed = 5;
        this.hasActiveObstacle = false; // Track if there's an active obstacle on screen
    }

    /**
     * Update all obstacles and coins
     */
    update() {
        // Increase difficulty over time
        const difficultyMultiplier = 1 + Math.floor(this.game.score / 10) * 0.1;
        const currentSpeed = this.baseSpeed * difficultyMultiplier;
        
        // Check if there's currently an obstacle on screen
        this.hasActiveObstacle = this.obstacles.length > 0;
        
        // Update obstacle spawn timing - only spawn a new obstacle if no active obstacles
        if (!this.hasActiveObstacle) {
            this.obstacleTimer++;
            if (this.obstacleTimer >= this.obstacleInterval) {
                this.obstacleTimer = 0;
                
                // Create a new obstacle
                this.obstacles.push(new Obstacle(this.game, currentSpeed));
                
                // Decrease interval as game progresses (increase difficulty)
                this.obstacleInterval = Math.max(60, this.obstacleInterval - 1);
            }
        }
        
        // Update coin spawn timing
        this.coinTimer++;
        if (this.coinTimer >= this.coinInterval) {
            this.coinTimer = 0;
            this.coins.push(new Coin(this.game, currentSpeed * 0.8)); // Coins move slightly slower
            
            // Decrease interval as game progresses (increase difficulty)
            this.coinInterval = Math.max(40, this.coinInterval - 1);
        }
        
        // Update all obstacles
        this.obstacles.forEach(obstacle => obstacle.update());
        
        // Remove marked obstacles
        this.obstacles = this.obstacles.filter(obstacle => !obstacle.markedForDeletion);
        
        // Update all coins
        this.coins.forEach(coin => coin.update());
        
        // Remove marked coins
        this.coins = this.coins.filter(coin => !coin.markedForDeletion);
    }
    
    /**
     * Check if there's enough space to spawn a new obstacle
     * @returns {boolean} Whether a new obstacle can be spawned
     */
    hasEnoughSpaceForObstacle() {
        // This method is no longer used since we only have one obstacle at a time
        return true;
    }

    /**
     * Draw all obstacles and coins
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        this.obstacles.forEach(obstacle => obstacle.draw(ctx));
        this.coins.forEach(coin => coin.draw(ctx));
    }

    /**
     * Reset the obstacle manager
     */
    reset() {
        this.obstacles = [];
        this.coins = [];
        this.obstacleTimer = 0;
        this.coinTimer = 0;
        this.obstacleInterval = 100;
        this.coinInterval = 80;
        this.hasActiveObstacle = false;
    }
}