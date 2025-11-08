export class VendingComponent {
    constructor(items = []) {
        // items example: [{ id: 'item_001_water', price: 10 }]
        this.stock = items;
    }
}
