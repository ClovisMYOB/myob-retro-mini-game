/**
 * PowerUp system for MYOB Retro Runner
 * Handles power-up activation and effects
 */
class PowerUpManager {
    /**
     * Initialize the power-up manager
     * @param {Object} game - Reference to the main game object
     */
    constructor(game) {
        this.game = game;
        this.coinThreshold = 20; // Coins needed for regular power-up
        this.superThreshold = 100; // Coins needed for super power-up
        this.isPowerUpAvailable = false;
        this.isSuperPowerUpAvailable = false;
        this.lastCheckedScore = 0; // Track the last score we checked
    }

    /**
     * Check if player has collected enough coins for a power-up
     * @param {number} coinCount - Current coin count
     * @returns {boolean} Whether power-up is available
     */
    checkPowerUpAvailability(coinCount) {
        // No need to check if the score hasn't changed
        if (coinCount === this.lastCheckedScore) {
            return false;
        }

        // Calculate the last multiple of threshold before current score and last checked score
        const lastSuperThresholdPassed = Math.floor(this.lastCheckedScore / this.superThreshold);
        const currentSuperThresholdPassed = Math.floor(coinCount / this.superThreshold);
        
        const lastRegularThresholdPassed = Math.floor(this.lastCheckedScore / this.coinThreshold);
        const currentRegularThresholdPassed = Math.floor(coinCount / this.coinThreshold);
        
        // Update the last checked score
        this.lastCheckedScore = coinCount;
        
        // Check if we've crossed a super threshold (multiple of 100)
        // Super powerups can override existing powerups
        if (currentSuperThresholdPassed > lastSuperThresholdPassed) {
            this.isSuperPowerUpAvailable = true;
            this.isPowerUpAvailable = false; // Prioritize super over regular
            return true;
        }
        // Check if we've crossed a regular threshold (multiple of 20, but not 100)
        // Regular powerups can't be triggered if a previous one is still active
        else if (currentRegularThresholdPassed > lastRegularThresholdPassed && 
                 coinCount % this.superThreshold !== 0 && 
                 !this.game.player.hasPowerUp) { // Only allow if no active powerup
            this.isPowerUpAvailable = true;
            return true;
        }
        
        return false;
    }

    /**
     * Activate power-up effects
     */
    activatePowerUp() {
        if (this.isSuperPowerUpAvailable) {
            // Apply super power-up effects to player
            this.game.player.activatePowerUp(true);
            
            // Visual/audio feedback
            this.showPowerUpActivation(true);
            
            // Reset availability
            this.isSuperPowerUpAvailable = false;
            
            return true;
        }
        else if (this.isPowerUpAvailable) {
            // Apply regular power-up effects to player
            this.game.player.activatePowerUp(false);
            
            // Visual/audio feedback
            this.showPowerUpActivation(false);
            
            // Reset availability
            this.isPowerUpAvailable = false;
            
            return true;
        }
        return false;
    }

    /**
     * Show visual feedback for power-up activation
     * @param {boolean} isSuper - Whether this is a super power-up
     */
    showPowerUpActivation(isSuper = false) {
        // Add visual effects to canvas
        const canvas = document.getElementById('game-canvas');
        
        if (isSuper) {
            canvas.classList.add('super-power-up-active');
        } else {
            canvas.classList.add('power-up-active');
        }
        
        // Remove after animation completes
        setTimeout(() => {
            // Keep the effect if power-up is still active
            if (!this.game.player.hasPowerUp) {
                canvas.classList.remove('power-up-active');
                canvas.classList.remove('super-power-up-active');
            }
        }, 1000);
    }

    /**
     * Reset power-up manager state
     */
    reset() {
        this.isPowerUpAvailable = false;
        this.isSuperPowerUpAvailable = false;
        document.getElementById('game-canvas').classList.remove('power-up-active');
        document.getElementById('game-canvas').classList.remove('super-power-up-active');
    }
}