import { CheckRespawn } from './systems/entropy.js';

export class LegacyManager {
    constructor() {
        this.storageKey = 'sim_graveyard_v1';
    }

    handlePermadeath(world, playerEntity) {
        console.log("[LegacyManager] Processing player death...");
        const mpComp = world.getComponent(playerEntity, 'MicroplasticsComponent');
        const mpValue = mpComp ? mpComp.amount : 0;

        if (!CheckRespawn(mpValue)) {
            this.triggerTrueGameOver();
            return;
        }

        this.addToGraveyard({
            date: new Date().toISOString(),
            microplastics: mpValue,
        });

        alert("YOU DIED. Your legacy has been recorded. Another will take your place.");
        location.reload();
    }

    addToGraveyard(record) {
        try {
            const raw = localStorage.getItem(this.storageKey);
            const graveyard = raw ? JSON.parse(raw) : [];
            graveyard.push(record);
            localStorage.setItem(this.storageKey, JSON.stringify(graveyard));
        } catch (e) {
            console.warn("[LegacyManager] Graveyard save failed.", e);
        }
    }

    triggerTrueGameOver() {
        alert("GAME OVER. GENETIC FAILURE. Save file corrupted.");
        localStorage.removeItem(this.storageKey);
        location.reload();
    }
}
