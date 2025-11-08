import { System } from '../ecs.js';

export class TradingSystem extends System {
    constructor(world) {
        super();
        this.world = world;
    }

    // We don't use update(), we use direct interaction via main.js event wiring,
    // OR we can listen for the event here. Let's listen here to keep main.js cleaner.
    // ACTUALLY, to keep the pattern from main.js v12, we'll handle it in the
    // main event listener for now, OR we create a specific event for it.
    // Let's stick to the established pattern: main.js detects WHAT you hit,
    // then dispatches a specific event.

    // REVISED PLAN: We will handle the logic in a unified 'InteractionSystem' eventually,
    // but for now, let's put the trade logic here and call it from main.js.

    attemptPurchase(player, machineId) {
        const wallet = this.world.getComponent(player, 'CurrencyComponent');
        const vendor = this.world.getComponent(machineId, 'VendingComponent');
        const inventory = this.world.getComponent(player, 'InventoryComponent');

        if (!wallet || !vendor || !inventory) return;

        // For simple vending, just buy the first item in stock for now
        // (A real system would need a UI to select).
        const itemToBuy = vendor.stock[0];
        if (!itemToBuy) {
            this.updateUI("Machine is empty.");
            return;
        }

        if (wallet.amount >= itemToBuy.price) {
            if (inventory.addItem({ id: itemToBuy.id, name: "Vended Item" })) {
                 wallet.amount -= itemToBuy.price;
                 this.updateUI(`Purchased item for $${itemToBuy.price}. Remaining: $${wallet.amount}`);
                 // Optional: remove from stock if limited
                 // vendor.stock.shift();
            } else {
                 this.updateUI("Inventory full.");
            }
        } else {
            this.updateUI(`Need $${itemToBuy.price} (You have $${wallet.amount})`);
        }
    }

    updateUI(msg) {
        document.getElementById('ui-textbox').innerText = msg;
    }
}
