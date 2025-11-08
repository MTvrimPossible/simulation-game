/**
 * InventoryComponent.js
 * Holds a list of item objects.
 * Capacity can be added later for complexity.
 */
export class InventoryComponent {
    constructor(capacity = 10) {
        this.items = [];
        this.capacity = capacity;
    }

    addItem(item) {
        if (this.items.length < this.capacity) {
            this.items.push(item);
            return true;
        }
        return false; // Inventory full
    }

    removeItem(itemId) {
        const idx = this.items.findIndex(i => i.id === itemId);
        if (idx > -1) {
            return this.items.splice(idx, 1)[0];
        }
        return null;
    }
}
