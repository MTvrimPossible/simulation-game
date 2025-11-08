// src/game_loop.js - v2 (Pause-aware)

class InputManager {
    constructor() {
        this.lastAction = null;
        this.keyMap = {
            'ArrowUp': 'MOVE_UP', 'ArrowDown': 'MOVE_DOWN',
            'ArrowLeft': 'MOVE_LEFT', 'ArrowRight': 'MOVE_RIGHT',
            'w': 'MOVE_UP', 's': 'MOVE_DOWN', 'a': 'MOVE_LEFT', 'd': 'MOVE_RIGHT'
        };
        window.addEventListener('keydown', (e) => {
            if (this.keyMap[e.key]) {
                this.lastAction = this.keyMap[e.key];
                e.preventDefault();
            }
        });
    }
    getAction() {
        const action = this.lastAction;
        this.lastAction = null;
        return action;
    }
}

export class GameLoop {
    constructor(world, renderer) {
        this.world = world;
        this.renderer = renderer;
        this.input = new InputManager();
        this.isRunning = false;
        this.main = this.main.bind(this);
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            requestAnimationFrame(this.main);
        }
    }

    stop() { this.isRunning = false; }

    main(timestamp) {
        if (!this.isRunning) return;

        // CRITICAL FIX: Keep the loop alive, but DO NOT process if paused.
        requestAnimationFrame(this.main);
        if (this.world.isPaused) return;

        // 1. CHECK INPUT
        const action = this.input.getAction();

        // 2. UPDATE
        if (action) {
            this.world.latestAction = action;
            this.world.updateSystems(1);
            this.world.latestAction = null;
        }

        // 3. RENDER
        const mapData = (this.world.getCurrentMap && this.world.getCurrentMap()) || [['.']];
        const entitiesToRender = (this.world.getRenderableEntities && this.world.getRenderableEntities()) || [];
        this.renderer.render(mapData, entitiesToRender);
    }
}
