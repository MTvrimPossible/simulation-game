/**
 * era_manager.js
 * PILLAR 5: RADICAL MODULARITY (Global State)
 *
 * The Single Source of Truth for the current macroscopic game state (Era).
 * Other systems query this to determine their operational mode.
 */

// Pseudo-Enum for Era definitions to prevent magic strings
export const ERAS = Object.freeze({
    RITUAL: 'RITUAL',       // Early game: strict rules, cyclical time
    HEROIC: 'HEROIC',       // Mid game: individual agency, breaking cycles
    DEMOCRATIC: 'DEMOCRATIC' // Late game: systems collapse into mass governance
});

export class GlobalEraManager {
    constructor() {
        // Singleton enforcement
        if (GlobalEraManager.instance) {
            return GlobalEraManager.instance;
        }

        this.currentEra = ERAS.RITUAL;
        GlobalEraManager.instance = this;
    }

    /**
     * Returns the current active Era.
     * @returns {string} One of the ERAS enum values.
     */
    getEra() {
        return this.currentEra;
    }

    /**
     * Debug/Cheat method to force an era change.
     * In a real game, this would be triggered by specific complex conditions.
     * @param {string} newEra
     */
    setEra(newEra) {
        if (Object.values(ERAS).includes(newEra)) {
            console.log(`[GlobalEraManager] Era changed from ${this.currentEra} to ${newEra}`);
            this.currentEra = newEra;
            // Ideally, this would dispatch a global event like 'OnEraChange'
            // just like the TimeSystem does.
        } else {
            console.error(`[GlobalEraManager] Attempted to set invalid Era: ${newEra}`);
        }
    }
}
