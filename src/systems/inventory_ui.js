// src/systems/inventory_ui.js - v2 (Triggers pause)

import { System } from '../ecs.js';

export class InventoryUISystem extends System {
    constructor(world, renderer) {
        super();
        this.world = world;
        this.renderer = renderer;
        this.isOpen = false;

        window.addEventListener('keydown', (e) => {
            // Toggle with 'I'
            if (e.key === 'i' || e.key === 'I') {
                this.toggleInventory();
            }
            // Select with Number Keys if open
            if (this.isOpen && e.key >= '1' && e.key <= '9') {
                this.handleItemSelection(parseInt(e.key) - 1);
            }
        });
    }

    toggleInventory() {
        this.isOpen = !this.isOpen;
        // CRITICAL: Tell the world to pause/unpause
        this.world.isPaused = this.isOpen;

        if (this.isOpen) {
            this.renderInventory();
        } else {
            // When closing, the GameLoop will naturally re-render the map next frame.
        }
    }

    renderInventory() {
        const player = this.world.playerEntityId;
        const inventory = this.world.getComponent(player, 'InventoryComponent');
        if (!inventory) return;

        let output = "=== INVENTORY ===\n\n";
        if (inventory.items.length === 0) {
            output += "(Empty)";
        } else {
            inventory.items.forEach((item, index) => {
                output += `[${index + 1}] ${item.name}\n`;
            });
        }
        output += "\n[I] Close";

        document.getElementById('game-screen').innerHTML = output;
    }

    handleItemSelection(index) {
        const player = this.world.playerEntityId;
        const inventory = this.world.getComponent(player, 'InventoryComponent');

        if (inventory && inventory.items[index]) {
            const item = inventory.items[index];

            // Dispatch consume event
            window.dispatchEvent(new CustomEvent('OnConsumeItem', {
                 detail: { entityId: player, item: item }
            }));

            // Remove and close
            inventory.items.splice(index, 1);
            this.toggleInventory();
            document.getElementById('ui-textbox').innerText = `Used: ${item.name}`;
        }
    }
}
