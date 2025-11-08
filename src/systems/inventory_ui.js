import { System } from '../ecs.js';

export class InventoryUISystem extends System {
    constructor(world, renderer) {
        super();
        this.world = world;
        this.renderer = renderer;
        this.isOpen = false;
        this.inventoryAction = null; // 'USE' or 'DROP'

        // Listen for 'I' key to toggle inventory
        window.addEventListener('keydown', (e) => {
            if (e.key === 'i' || e.key === 'I') {
                this.toggleInventory();
            }
            // If open, handle number keys for selection
            if (this.isOpen && e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                this.handleItemSelection(index);
            }
        });
    }

    toggleInventory() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            console.log("[InventoryUI] Opened.");
            this.renderInventory();
            // Pause game loop here if we had a unified pause mechanism
        } else {
            console.log("[InventoryUI] Closed.");
            // Clear UI area by re-rendering the game world next frame naturally
             // For now, we might need to manually trigger a re-render or clear the pre tag if the game loop doesn't immediately overwrite it.
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

        // HACK: Directly overwrite the game screen for now.
        // In a real engine, this would be a separate UI layer on top of the canvas/pre.
        document.getElementById('game-screen').innerHTML = output;
    }

    handleItemSelection(index) {
        const player = this.world.playerEntityId;
        const inventory = this.world.getComponent(player, 'InventoryComponent');

        if (inventory && inventory.items[index]) {
            const item = inventory.items[index];
            console.log(`[InventoryUI] Selected ${item.name}`);
            // TODO: trigger 'USE' action here
             this.useItem(player, item, index);
             this.toggleInventory(); // Close after use
        }
    }

    useItem(player, itemData, index) {
         // Dispatch event for other systems to handle the specific EFFECT of the item
         // e.g. NeedsSystem listens for 'OnConsumeItem'
         window.dispatchEvent(new CustomEvent('OnConsumeItem', {
             detail: { entityId: player, item: itemData }
         }));

         // Remove from inventory
         const inventory = this.world.getComponent(player, 'InventoryComponent');
         inventory.items.splice(index, 1);

         document.getElementById('ui-textbox').innerText = `Used: ${itemData.name}`;
    }
}
