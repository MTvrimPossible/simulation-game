/**
 * contagion.js
 * PILLAR 3: SYSTEMIC INTERACTIONS
 *
 * Handles the transmission of "viral" data between entities.
 * This can be literal (diseases from bad food) or abstract (ideas/lies passed during dialogue).
 */

import { System } from '../ecs.js';

export class ContagionSystem extends System {
    constructor() {
        super();
        // We need positions to determine who is close enough to infect whom.
        this.requiredComponents = ['ContagionComponent', 'PositionComponent'];
    }

    update(world, entities, turns_passed) {
        // No transmission if time hasn't passed.
        if (turns_passed <= 0) return;

        // O(N^2) naive interaction check.
        // TODO: Optimization - Use a spatial partition grid for larger worlds.
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entA = entities[i];
                const entB = entities[j];

                if (this.areInteracting(world, entA, entB)) {
                    this.attemptTransmission(world, entA, entB);
                    this.attemptTransmission(world, entB, entA);
                }
            }
        }
    }

    /**
     * Determines if two entities are currently capable of passing contagions.
     * Currently uses simple adjacency. Future upgrades should check for
     * "Socializing" AI states or "Eating" events.
     */
    areInteracting(world, entA, entB) {
        const posA = world.getComponent(entA, 'PositionComponent');
        const posB = world.getComponent(entB, 'PositionComponent');

        // Simple Manhattan distance check for adjacency (distance of 1)
        const dist = Math.abs(posA.x - posB.x) + Math.abs(posA.y - posB.y);
        return dist <= 1;
    }

    /**
     * Tries to pass contagions from source to target.
     */
    attemptTransmission(world, sourceId, targetId) {
        const sourceContagion = world.getComponent(sourceId, 'ContagionComponent');
        const targetContagion = world.getComponent(targetId, 'ContagionComponent');

        // Iterate through all contagions carried by the source
        for (const [virusName, data] of Object.entries(sourceContagion.viruses)) {
            // If target already has it, maybe skip or increase load (stub: skip for now)
            if (targetContagion.viruses[virusName]) continue;

            // Roll for transmission based on the virus's inherent contagiousness
            if (Math.random() < data.transmissibility) {
                // Successful transmission!
                // console.log(`Contagion: ${virusName} passed from ${sourceId} to ${targetId}`);

                // Clone the contagion data to the new host
                targetContagion.viruses[virusName] = { ...data };

                // Optional: If this is a "transformative" contagion (e.g., bad food),
                // trigger an immediate effect event here.
            }
        }
    }
}
