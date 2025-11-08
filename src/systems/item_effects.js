import { System } from '../ecs.js';

export class ItemEffectSystem extends System {
    constructor(world, moduleManager) {
        super();
        this.world = world;
        this.moduleManager = moduleManager;

        window.addEventListener('OnConsumeItem', (e) => this.handleConsumption(e));
    }

    handleConsumption(e) {
        const { entityId, item } = e.detail;
        // item is the object passed from InventoryUISystem, which might just be { id, name }
        // Let's ensure we look up by ID.

        const itemData = this.moduleManager.items[item.id];
        if (!itemData || !itemData.OnUse) return;

        if (itemData.OnUse.effect === 'SatisfyNeed') {
            const needs = this.world.getComponent(entityId, 'NeedsComponent');
            if (needs) {
                const target = itemData.OnUse.target_need; // e.g., "Dr"
                const amount = itemData.OnUse.amount;
                
                // Apply and clamp to max 100
                needs[target] = Math.min(100, needs[target] + amount);
                
                console.log(`[ItemEffect] Restored ${amount} to ${target}. Current: ${needs[target]}`);
                
                // Optional: Feedback via UI
                // We could dispatch another event here for a UI system to pick up
            }
        }
    }
}
