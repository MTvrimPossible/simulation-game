/**
 * legacy_manager.js
 * PILLAR 4: MEMORY & CONSEQUENCE (Roguelite Structure)
 *
 * Manages the transition between lives. It determines if a "true death"
 * occurs based on Microplastics (entropy) and handles saving deceased
 * characters to the graveyard.
 */

import { CheckRespawn } from './systems/entropy.js';

export class LegacyManager {
    constructor() {
        this.storageKey = 'sim_graveyard_v1';
    }

    /**
     * The core sequence triggered when the player dies.
     * @param {World} world - ECS World reference to grab components.
     * @param {number} playerEntity - The ID of the dying player.
     */
    handlePermadeath(world, playerEntity) {
        console.log("[LegacyManager] Processing player death...");

        // STEP 1: Get critical entropy value
        const mpComp = world.getComponent(playerEntity, 'MicroplasticsComponent');
        const mpValue = mpComp ? mpComp.amount : 0;

        // STEP 2: The Great Filter (Entropy Check)
        // If CheckRespawn returns false, the run is truly over.
        if (!CheckRespawn(mpValue)) {
            this.triggerTrueGameOver();
            return;
        }

        // STEP 3: Inheritance (Marriage/Perks)
        // STUB: Checks if player had a partner to pass down specific traits.
        // const marriage = world.getComponent(playerEntity, 'MarriageComponent');
        // if (marriage?.isMarried) { this.inheritPerks(...) }

        // STEP 4: Bury the dead
        // We save their final state to localStorage for historical viewing.
        this.addToGraveyard({
            date: new Date().toISOString(),
            microplastics: mpValue,
            // Add other stats here eventually: turns survived, cause of death, etc.
        });

        // STEP 5: Re-initialize (New Sibling)
        // Dispatch event for Main.js to catch and reset the game state.
        window.dispatchEvent(new CustomEvent('OnRequestRespawn'));
    }

    /**
     * Saves a death record to browser local storage.
     */
    addToGraveyard(record) {
        try {
            const raw = localStorage.getItem(this.storageKey);
            const graveyard = raw ? JSON.parse(raw) : [];
            graveyard.push(record);
            localStorage.setItem(this.storageKey, JSON.stringify(graveyard));
            console.log("[LegacyManager] Ancestor added to graveyard.");
        } catch (e) {
            console.warn("[LegacyManager] Failed to save to graveyard (likely storage full).", e);
        }
    }

    triggerTrueGameOver() {
        console.error("[LegacyManager] GAME OVER: Lineage ended due to genetic failure.");
        // In a real scenario, this might also wipe the active save slot.
        window.dispatchEvent(new CustomEvent('OnGameOver', {
            detail: { reason: 'CATASTROPHIC_GENETIC_FAILURE' }
        }));
    }
}
