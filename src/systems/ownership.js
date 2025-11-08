/**
 * ownership.js
 * PILLAR 3: SYSTEMIC INTERACTIONS (Crime & Consequences)
 *
 * Manages item ownership, theft tagging, and the "volatile goods" mechanic
 * where stolen items eventually self-immolate.
 */

import { System } from '../ecs.js';

// How many turns before a stolen item bursts into flames.
const STOLEN_ITEM_LIFESPAN = 100;

export class OwnershipSystem extends System {
    constructor() {
        super();
        // We need to scan every inventory in the game every turn.
        this.requiredComponents = ['InventoryComponent'];

        // Decoupled Event Listener for when an item moves from World -> Inventory
        window.addEventListener('OnPickupItem', this.handlePickup.bind(this));
    }

    /**
     * Event handler for 'OnPickupItem'.
     * Expected detail: { entityId: number, item: object }
     */
    handlePickup(e) {
        const { entityId, item } = e.detail;

        // 1. Check Ownership
        // If the item is not 'Public' and NOT owned by the person picking it up...
        // (We assume entities might have a specific 'owner ID' tag, defaulting to their entityId for now)
        if (item.owner !== 'Public' && item.owner !== entityId) {
            // 2. Mark as Stolen
            item.isStolen = true;
            // Initialize the volatile timer if not already set
            if (!item.stolenTimer) {
                item.stolenTimer = STOLEN_ITEM_LIFESPAN;
            }
            // console.log(`[OwnershipSystem] CRIME: Entity ${entityId} stole ${item.name} (Owner: ${item.owner})`);
        }
    }

    update(world, entities, turns_passed) {
        if (turns_passed <= 0) return;

        for (const entityId of entities) {
            const inventory = world.getComponent(entityId, 'InventoryComponent');

            // Iterate backwards so we can safely remove items while looping
            for (let i = inventory.items.length - 1; i >= 0; i--) {
                const item = inventory.items[i];

                if (item.isStolen) {
                    // 3. Tick Timer
                    item.stolenTimer -= turns_passed;

                    // 4. Check Expiration ("Turns into flame")
                    if (item.stolenTimer <= 0) {
                        // console.log(`[OwnershipSystem] VOLATILE: Stolen ${item.name} ignited in inventory of Entity ${entityId}!`);

                        // Destroy the item
                        inventory.items.splice(i, 1);

                        // OPTIONAL: Deal damage to the holder.
                        // This fulfills the "use to your advantage" clause (planting stolen goods on NPCs).
                        // const health = world.getComponent(entityId, 'HealthComponent');
                        // if (health) health.takeDamage(5, 'FIRE');
                    }
                }
            }
        }
    }
}
