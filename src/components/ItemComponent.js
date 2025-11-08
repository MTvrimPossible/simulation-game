export class ItemComponent {
    constructor(itemId, name) {
        this.itemId = itemId; // e.g., 'item_001_water' matches data/items.json
        this.name = name;     // e.g., 'Bottled Water'
    }
}
