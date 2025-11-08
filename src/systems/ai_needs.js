/**
 * ai_needs.js
 * PILLAR 5: RADICAL MODULARITY
 *
 * This system monitors entity needs and, when critical, establishes
 * a destination to satisfy them. It does NOT handle movement.
 */

import { System } from '../ecs.js';
import { DestinationComponent } from '../components/DestinationComponent.js';

// Threshold below which a need is considered "critical" and triggers standard AI overrides.
const BEELINE_THRESHOLD = 30;

export class AINeedsSystem extends System {
    /**
     * @param {object} moduleManager - Access to global definitions (if needed for complex lookups).
     */
    constructor(moduleManager) {
        super();
        this.moduleManager = moduleManager;
        this.requiredComponents = ['NeedsComponent', 'PositionComponent'];

        // Mapping needs (short codes) to required semantic tags on world objects.
        this.NEED_TO_TAG = {
            'Ea': 'TAG_FOOD_SOURCE',
            'Dr': 'TAG_DRINK_SOURCE',
            'Sl': 'TAG_BED',
            'Pi': 'TAG_TOILET',
            'Hy': 'TAG_SHOWER',
            'So': 'TAG_SOCIAL_SPOT',
            'Fu': 'TAG_ENTERTAINMENT'
        };
    }

    update(world, entities, turns_passed) {
        for (const entityId of entities) {
            const needs = world.getComponent(entityId, 'NeedsComponent');
            const pos = world.getComponent(entityId, 'PositionComponent');

            // STEP 2: Apply Decay
            needs.updateDecay(turns_passed);

            // STEP 3: Check if already busy (has a destination)
            if (world.getComponent(entityId, 'DestinationComponent')) {
                continue;
            }

            // STEP 4: Evaluate Needs
            const strongest = needs.getStrongestNeed();

            // STEP 5: Threshold Check (Standard Sims-like autonomy)
            // If the need is still high enough (e.g. > 30), don't override behavior yet.
            if (strongest.value > BEELINE_THRESHOLD) {
                continue;
            }

            // STEP 6: Identify required solution
            const requiredTag = this.NEED_TO_TAG[strongest.name];
            if (!requiredTag) {
                 console.warn(`Entity ${entityId} has unknown critical need: ${strongest.name}`);
                 continue;
            }

            // STEP 7: Find nearest satisfier
            // (We use a helper method to keep the main loop clean)
            const targetCoords = this.findNearestSatisfier(world, pos, requiredTag);

            // STEP 8 & 9: Act on results
            if (targetCoords) {
                // console.log(`Entity ${entityId} critical ${strongest.name} (${strongest.value.toFixed(1)}). Beelining to ${requiredTag} at ${targetCoords.x},${targetCoords.y}`);
                // Add the destination. Another system will handle getting them there.
                world.addComponent(entityId, 'DestinationComponent', new DestinationComponent(targetCoords.x, targetCoords.y));
            } else {
                // Despair state: Need is critical but no solution exists on the map.
                // In a full game, this might trigger a "Wandering" AI package or specific despair dialogue.
                if (Math.random() < 0.05) { // Don't spam the logs every single frame
                     console.log(`Entity ${entityId} is despairing! Needs ${strongest.name} but found no ${requiredTag}.`);
                }
            }
        }
    }

    /**
     * Naive search for the nearest entity with a specific tag.
     * In a larger game, this should use a spatial partition (quadtree/grid) for performance.
     */
    findNearestSatisfier(world, originPos, tag) {
        let nearestDist = Infinity;
        let nearestCoords = null;

        // We assume world objects that satisfy needs have a 'TagComponent' or similar.
        // Since we don't have a TagComponent yet, this is a placeholder implementation
        // assuming we might filter by raw data later.

        // TODO: Once we have a 'WorldObject' or 'TagComponent', iterate those specific entities.
        // For now, returning null to prevent crashes until we populate the world with interactables.
        return null;

        /* Implementation Example once TagComponent exists:
        const candidates = world.getEntitiesWith('TagComponent', 'PositionComponent');
        for (const candId of candidates) {
            const candTags = world.getComponent(candId, 'TagComponent').tags;
            if (candTags.includes(tag)) {
                 const candPos = world.getComponent(candId, 'PositionComponent');
                 const dist = Math.abs(originPos.x - candPos.x) + Math.abs(originPos.y - candPos.y); // Manhattan distance
                 if (dist < nearestDist) {
                     nearestDist = dist;
                     nearestCoords = { x: candPos.x, y: candPos.y };
                 }
            }
        }
        return nearestCoords;
        */
    }
}
