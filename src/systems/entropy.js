/**
 * entropy.js
 * PILLAR 4: MEMORY & CONSEQUENCE (Persistent Stats)
 *
 * Manages the irreversible accumulation of microplastics.
 * This stat never decreases and directly determines the likelihood
 * of a "true death" (save file corruption/deletion) upon starting a new run.
 */

import { System } from '../ecs.js';

// The threshold at which respawn failure is guaranteed (100% chance).
const MAX_MICROPLASTICS = 1000;

/**
 * Critical helper function used by LegacyManager.
 * Determines if the player's genetic material is too corrupted to respawn.
 * @param {number} currentLoad - The total microplastics accumulated.
 * @returns {boolean} True if respawn is successful, False if permadeath occurs.
 */
export function CheckRespawn(currentLoad) {
    // Calculate failure chance (e.g., 500 / 1000 = 0.5 or 50% chance of failure)
    const failChance = Math.min(1.0, currentLoad / MAX_MICROPLASTICS);

    // Roll for survival
    // If random() is LESS than failChance, they fail.
    // e.g., failChance 0.1. Random is 0.05 -> FAIL.
    if (Math.random() < failChance) {
        console.log(`[Entropy] RESPAWN FAILED. Load: ${currentLoad} (Chance: ${(failChance * 100).toFixed(1)}%)`);
        return false;
    }

    console.log(`[Entropy] Respawn successful. Load: ${currentLoad}`);
    return true;
}

export class MicroplasticsSystem extends System {
    constructor() {
        super();
        // We only need to access entities that can actually accumulate this stat.
        this.requiredComponents = ['MicroplasticsComponent'];

        // Listen for consumption events
        window.addEventListener('OnConsumeItem', this.handleConsumption.bind(this));
    }

    /**
     * Event handler for 'OnConsumeItem'.
     * Expected detail: { entityId: number, item: object }
     */
    handleConsumption(e) {
        const { entityId, item } = e.detail;

        // 1. Validate if the item has microplastics
        // (Using optional chaining in case the item data is incomplete)
        const amountToAdd = item.OnUse?.addMicroplastics || item.Interaction?.addMicroplastics || 0;

        if (amountToAdd > 0) {
            // 2. Get the component (if the entity has it)
            // We can't use 'this.world' here easily unless we bind it in registerSystem,
            // so we'll assume the event might pass the world, OR we rely on standard ECS lookups if available.
            // FOR NOW: We will assume the main loop binds 'world' to standard events or we pass it.
            // *Self-correction for this architecture*: We'll assume we can get the component via global access
            // or that the event dispatcher included a reference to the world for convenience.
            // *Alternative (Better)*: Real systems usually queue events to process in update().
            // For simplicity in this engine, we'll assume a global or passed 'world' reference exists,
            // OR we wait until standard ECS update.

            // Let's use a queue approach for safety to avoid tight coupling in event listeners.
            this.consumptionQueue = this.consumptionQueue || [];
            this.consumptionQueue.push({ entityId, amount: amountToAdd });
        }
    }

    update(world, entities, turns_passed) {
        // Process validated consumption events safely within the game loop
        if (this.consumptionQueue && this.consumptionQueue.length > 0) {
            for (const event of this.consumptionQueue) {
                const mpComp = world.getComponent(event.entityId, 'MicroplasticsComponent');
                if (mpComp) {
                    mpComp.add(event.amount);
                    // console.log(`[Entropy] Entity ${event.entityId} ingested ${event.amount} microplastics. Total: ${mpComp.amount}`);
                }
            }
            // Clear queue
            this.consumptionQueue = [];
        }
    }
}
