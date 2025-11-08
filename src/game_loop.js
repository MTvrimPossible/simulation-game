/**
 * game_loop.js
 * Orchestrates the main browser Render/Update cycle.
 *
 * PILLAR 4: TECH STACK (Modern ES6, rAF)
 * TIME CONSTRAINT: "Organize time against movement" (Turn-based)
 */

class InputManager {
    constructor() {
        this.lastAction = null;

        // Simple key mapping
        this.keyMap = {
            'ArrowUp': 'MOVE_UP',
            'ArrowDown': 'MOVE_DOWN',
            'ArrowLeft': 'MOVE_LEFT',
            'ArrowRight': 'MOVE_RIGHT',
            'Enter': 'CONFIRM',
            'Escape': 'CANCEL'
        };

        // Non-blocking input listener
        window.addEventListener('keydown', (e) => {
            if (this.keyMap[e.key]) {
                this.lastAction = this.keyMap[e.key];
                // Optional: prevent default browser scrolling for arrow keys
                e.preventDefault();
            }
        });
    }

    /**
     * Retrieves and consumes the last action.
     * Returns null if no new action has occurred since last check.
     */
    getAction() {
        const action = this.lastAction;
        this.lastAction = null; // Consume the action so it only triggers once per press
        return action;
    }
}

export class GameLoop {
    /**
     * @param {World} world - The ECS World.
     * @param {Renderer} renderer - The ASCII Renderer.
     */
    constructor(world, renderer) {
        this.world = world;
        this.renderer = renderer;
        this.input = new InputManager();
        this.isRunning = false;

        // Bind the main loop to 'this' so rAF can call it properly
        this.main = this.main.bind(this);
    }

    /**
     * Starts the game loop.
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            console.log("GameLoop: Started.");
            requestAnimationFrame(this.main);
        }
    }

    stop() {
        this.isRunning = false;
    }

    /**
     * The main game loop, driven by requestAnimationFrame.
     * @param {number} timestamp
     */
    main(timestamp) {
        if (!this.isRunning) return;

        // 1. CHECK INPUT
        const action = this.input.getAction();

        // 2. UPDATE (Conditional - Turn-Based)
        // Time only passes if the player did something.
        if (action) {
            // console.log(`Action registered: ${action}`); // Debug
            // In a real scenario, we might pass the 'action' to the world too,
            // or have a specific PlayerInputSystem handle it.
            // For now, we just advance time 1 turn.
            
            // We attach the action to the world temporarily so systems can see it this frame
            this.world.latestAction = action; 
            
            this.world.updateSystems(1); // 1 turn passed
            
            this.world.latestAction = null; // Clear it after update
        }

        // 3. RENDER
        // We need to fetch the current state from the world.
        // NOTE: These methods (getCurrentMap, getRenderableEntities) need to be added to World later.
        // specific implementation depends on your ECS setup.
        const mapData = (this.world.getCurrentMap && this.world.getCurrentMap()) || [['.', '.'], ['.', '.']]; 
        const entitiesToRender = (this.world.getRenderableEntities && this.world.getRenderableEntities()) || [];

        this.renderer.render(mapData, entitiesToRender);

        // 4. LOOP
        requestAnimationFrame(this.main);
    }
}
