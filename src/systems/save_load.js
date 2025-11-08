import { System } from '../ecs.js';

export class SaveLoadSystem extends System {
    constructor(world) {
        super();
        this.world = world;
        this.storageKey = 'sim_savegame_v1';

        window.addEventListener('keydown', (e) => {
            if (e.key === 'F5') {
                e.preventDefault();
                this.saveGame();
            } else if (e.key === 'F9') {
                e.preventDefault();
                this.loadGame();
            }
        });
    }

    saveGame() {
        console.log("[SaveLoad] Saving game...");
        try {
            const saveData = this.world.serialize();
            localStorage.setItem(this.storageKey, saveData);
            this.updateUI("Game Saved.");
        } catch (e) {
            console.error("Save failed:", e);
            this.updateUI("Save Failed (Storage Full?)");
        }
    }

    loadGame() {
        console.log("[SaveLoad] Loading game...");
        const saveData = localStorage.getItem(this.storageKey);
        if (!saveData) {
            this.updateUI("No save game found.");
            return;
        }

        try {
            // 1. Pause loop to prevent updates during surgery
            this.world.isPaused = true;

            // 2. Load state
            this.world.deserialize(saveData);

            // 3. RE-HYDRATION HACK:
            // Because JSON.stringify stripped methods from classes like NeedsComponent,
            // we need to manually re-assign them if we use them.
            // ALTERNATIVE: Don't use component methods. Move that logic to systems.
            // (See below for immediate fix).

            this.updateUI("Game Loaded.");
        } catch (e) {
            console.error("Load failed:", e);
            this.updateUI("Load Failed (Corrupt Data?)");
        } finally {
             // Unpause after a moment so they see the message
             setTimeout(() => this.world.isPaused = false, 1000);
        }
    }

    updateUI(msg) {
        const ui = document.getElementById('ui-textbox');
        if (ui) ui.innerText = msg;
    }
}
