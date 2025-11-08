import { System } from '../ecs.js';

export class MortalitySystem extends System {
    constructor(world, legacyManager) {
        super();
        this.world = world;
        this.legacyManager = legacyManager;
    }

    update(world, entities, turns_passed) {
        const player = world.playerEntityId;
        const needs = world.getComponent(player, 'NeedsComponent');

        if (needs) {
            if (needs.Ea <= 0 || needs.Dr <= 0) {
                console.log("[Mortality] Player has died of neglect.");
                // Trigger Permadeath
                this.legacyManager.handlePermadeath(world, player);
                
                // Stop the game loop (hacky way for now)
                // In a real engine, we'd have a proper GameStateManager.
                throw new Error("GAME_OVER"); // Will stop the loop by crashing it safely-ish
            }
        }
    }
}
