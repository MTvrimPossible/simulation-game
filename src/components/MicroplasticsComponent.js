/**
 * MicroplasticsComponent.js
 * Tracks the accumulation of microplastics in an organism.
 * A unique stat relevant to the game's themes.
 */
export class MicroplasticsComponent {
    constructor(initialAmount = 0) {
        this.amount = initialAmount;
    }

    add(value) {
        this.amount += value;
    }
}
