/**
 * NeedsComponent.js
 * Stores physiological and psychological needs for an entity (Sims-like).
 *
 * ARCHITECTURAL CHANGE: Class-based component with internal logic helpers.
 */

export class NeedsComponent {
    constructor() {
        // 1. PRIMARY NEEDS (0 = Critical/Death, 100 = Satisfied)
        this.Ea = 100; // Eat (Hunger)
        this.Dr = 100; // Drink (Thirst)
        this.Sl = 100; // Sleep (Energy)
        this.Pi = 100; // Piss (Bladder)
        this.Hy = 100; // Hygiene
        this.So = 100; // Social
        this.Fu = 100; // Fun

        // 2. DECAY RATES (Points lost per turn)
        // Default values - can be overridden by Traits later.
        this.Ea_decay = 0.05;
        this.Dr_decay = 0.08;
        this.Sl_decay = 0.03;
        this.Pi_decay = 0.06;
        this.Hy_decay = 0.02;
        this.So_decay = 0.04;
        this.Fu_decay = 0.05;
    }

    /**
     * Applies standard decay to all needs based on time passed.
     * "Lock in needs stats with turns"
     * @param {number} turns_passed
     */
    updateDecay(turns_passed) {
        if (turns_passed <= 0) return;

        this.Ea = Math.max(0, this.Ea - (this.Ea_decay * turns_passed));
        this.Dr = Math.max(0, this.Dr - (this.Dr_decay * turns_passed));
        this.Sl = Math.max(0, this.Sl - (this.Sl_decay * turns_passed));
        this.Pi = Math.max(0, this.Pi - (this.Pi_decay * turns_passed));
        this.Hy = Math.max(0, this.Hy - (this.Hy_decay * turns_passed));
        this.So = Math.max(0, this.So - (this.So_decay * turns_passed));
        this.Fu = Math.max(0, this.Fu - (this.Fu_decay * turns_passed));
    }

    /**
     * Identifies the most critical need (lowest value).
     * @returns {object} { name: 'Ea', value: 15.5 }
     */
    getStrongestNeed() {
        const needs = [
            { name: 'Ea', value: this.Ea },
            { name: 'Dr', value: this.Dr },
            { name: 'Sl', value: this.Sl },
            { name: 'Pi', value: this.Pi },
            { name: 'Hy', value: this.Hy },
            { name: 'So', value: this.So },
            { name: 'Fu', value: this.Fu }
        ];

        // Sort ascending (lowest value first)
        needs.sort((a, b) => a.value - b.value);

        return needs[0];
    }
}
