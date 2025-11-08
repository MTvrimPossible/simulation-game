import { System } from '../ecs.js';
import { DestinationComponent } from '../components/DestinationComponent.js';

export class AINeedsSystem extends System {
    constructor(moduleManager) {
        super();
        this.moduleManager = moduleManager;
        this.requiredComponents = ['NeedsComponent']; // Removed Position requirement for pure decay
    }

    update(world, entities, turns_passed) {
        for (const entityId of entities) {
            const needs = world.getComponent(entityId, 'NeedsComponent');

            // 1. APPLY DECAY (Moved from Component to System)
            if (turns_passed > 0) {
                 needs.Ea = Math.max(0, needs.Ea - (needs.Ea_decay * turns_passed));
                 needs.Dr = Math.max(0, needs.Dr - (needs.Dr_decay * turns_passed));
                 needs.Sl = Math.max(0, needs.Sl - (needs.Sl_decay * turns_passed));
            }

            // (AI Logic for movement would go here, but we simplfied it for this tutorial.
            // The original AI logic relied on getStrongestNeed which also needs moving if we want full AI back).
        }
    }
}
