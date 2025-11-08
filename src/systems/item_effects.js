import { System } from '../ecs.js';

export class ItemEffectSystem extends System {
    constructor(moduleManager) {
        super();
        this.moduleManager = moduleManager;
        // Doesn't need a standard update loop, just event listening
        this.requiredComponents = [];

        window.addEventListener('OnConsumeItem', (e) => this.handleConsumption(e));
    }

    handleConsumption(e) {
        const { entityId, item } = e.detail; // item is the ItemComponent { itemId, name }

        // 1. Look up full data from ModuleManager
        const itemData = this.moduleManager.items[item.id];
        if (!itemData || !itemData.OnUse) {
            console.log(`[ItemEffect] ${item.name} has no use effect.`);
            return;
        }

        // 2. Process Effect
        const effect = itemData.OnUse;
        if (effect.effect === 'SatisfyNeed') {
            this.applySatisfyNeed(entityId, effect);
        }
        // Add other effects here later (e.g., 'Heal', 'LearnSpell')
    }

    applySatisfyNeed(entityId, effect) {
        // We need access to the world to get components.
        // Since we don't have it easily in event handlers, we'll cheat and assume
        // we can access it via a global or pass it in.
        // BETTER ARCHITECTURE: The system should have a reference to 'world' assigned on registration.
        // FOR NOW: We'll rely on the fact that main.js is managing everything,
        // OR we pass 'world' into the constructor. Let's DO THAT.
    }
}
