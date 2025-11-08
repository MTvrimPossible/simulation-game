import { System } from '../ecs.js';
import { StartPoetryPong } from '../minigames/pong.js';

export class MinigameRunner extends System {
    constructor(world) {
        super();
        this.world = world;
        this.asciiScreen = document.getElementById('game-screen');
        this.canvasScreen = document.getElementById('minigame-canvas');
        this.uiText = document.getElementById('ui-textbox');
    }

    async run(minigameId, context = {}) {
        console.log(`[Minigame] Starting ${minigameId}...`);

        // 1. Pause Main Game
        this.world.isPaused = true;

        // 2. Swap Views
        this.asciiScreen.classList.add('hidden');
        this.canvasScreen.classList.remove('hidden');
        this.uiText.innerText = "Minigame started. Use your mouse.";

        // 3. Run specific game
        let result = null;
        try {
            if (minigameId === 'pong') {
                // We pass dummy inventory/stake for now as per the pong.js signature
                result = await StartPoetryPong('minigame-canvas', [], { id: 'poetry_stake', name: 'My Dignity' });
            } else {
                throw new Error(`Unknown minigame: ${minigameId}`);
            }
        } catch (e) {
            console.error("Minigame failed:", e);
            result = { outcome: 'error' };
        }

        // 4. Handle Result & Restore View
        this.canvasScreen.classList.add('hidden');
        this.asciiScreen.classList.remove('hidden');
        this.world.isPaused = false;

        this.handleResult(result);
    }

    handleResult(result) {
        if (result.outcome === 'win') {
             this.uiText.innerText = `Minigame WON! Prize: ${result.prize}`;
             // Give prize
             // this.world.getComponent(this.world.playerEntityId, 'InventoryComponent').addItem(...)
        } else if (result.outcome === 'loss') {
             this.uiText.innerText = `Minigame LOST. You lost: ${result.lost}`;
             // Remove stake
        } else {
             this.uiText.innerText = "Minigame ended abnormally.";
        }
    }
}
