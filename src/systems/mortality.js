import { System } from '../ecs.js';

export class MortalitySystem extends System {
    constructor(world, legacyManager) {
        super();
        this.world = world;
        this.legacyManager = legacyManager;
        this.isDead = false; // Prevent double-death loops
    }

    update(world, entities, turns_passed) {
        if (this.isDead) return;

        const player = world.playerEntityId;
        if (!player) return;

        const needs = world.getComponent(player, 'NeedsComponent');

        if (needs) {
            if (needs.Ea <= 0 || needs.Dr <= 0) {
                console.log("[Mortality] Player died of neglect.");
                this.isDead = true;
                this.legacyManager.handlePermadeath(world, player);
            }
        }
    }
}
