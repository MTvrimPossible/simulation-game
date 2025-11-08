/**
 * main.js
 * THE INTEGRATOR
 *
 * This is the entry point that ties all 5 Pillars together.
 * It strictly follows the initialization order to ensure data is ready
 * before systems try to use it.
 */

// --- 1. MODULE IMPORTS ---
import { World } from './src/ecs.js';
import { Renderer } from './src/renderer.js';
import { ModuleManager } from './src/module_manager.js';
import { GameLoop } from './src/game_loop.js';
import { PlayerControlSystem } from './src/systems/player_control.js';

// Systems
import { TimeSystem } from './src/systems/time_system.js';
import { AINeedsSystem } from './src/systems/ai_needs.js';
import { LieIdleSystem } from './src/systems/lie_idle.js';
import { ContagionSystem } from './src/systems/contagion.js';
import { OwnershipSystem } from './src/systems/ownership.js';
import { MicroplasticsSystem } from './src/systems/entropy.js';
import { ReputationSystem } from './src/systems/reputation.js';

// Managers & Generators
import { WorldGenerator } from './src/procgen/world_generator.js';
import { DialogueSystem } from './src/dialogue_system.js';
import { LegacyManager } from './src/legacy_manager.js';

// Components (Required for manual entity creation in Step 4)
import { PositionComponent } from './src/components/PositionComponent.js';
import { ASCIIRenderComponent } from './src/components/ASCIIRenderComponent.js';
import { NeedsComponent } from './src/components/NeedsComponent.js';
import { MicroplasticsComponent } from './src/components/MicroplasticsComponent.js';
// Stub for Inventory if not yet created separately:
class InventoryComponent { constructor() { this.items = []; } }
class ReputationComponent { constructor() { this.value = 0; } }

// --- MAIN INITIALIZATION ---
async function init() {
    console.log("[Main] Beginning initialization sequence...");

    // STEP 1: INSTANTIATE CORE MANAGERS
    const world = new World();
    const renderer = new Renderer('game-screen');
    const moduleManager = new ModuleManager();

    // STEP 2: LOAD DATA (ASYNC)
    try {
        await moduleManager.loadAllData();
    } catch (error) {
        console.error("FATAL: Could not load game data. Aborting start.");
        alert("FATAL ERROR: Could not load game data. Check console.");
        return;
    }

    // STEP 3: INSTANTIATE DATA-RELIANT MANAGERS
    const dialogueSystem = new DialogueSystem(moduleManager);
    const worldGenerator = new WorldGenerator(moduleManager);
    const legacyManager = new LegacyManager();

    // STEP 4: GENERATE WORLD & PLAYER
    console.log("[Main] Generating world...");
    const townData = worldGenerator.createTownMap();

    // Attach map data to world so GameLoop and Renderer can find it
    // (In a full ECS, this might be a 'MapComponent' on a global entity)
    world.getCurrentMap = () => townData.mapData;

    // 4a. Populate Static World Entities (Buildings)
    townData.buildingSpawns.forEach(spawn => {
        const building = world.createEntity();
        world.addComponent(building, 'PositionComponent', new PositionComponent(spawn.x, spawn.y));
        world.addComponent(building, 'ASCIIRenderComponent', new ASCIIRenderComponent('B', '#555555'));
        // In real implementation, we'd add a 'StructureComponent' with spawn.tags here
    });

    // 4b. Create Player (Inlining LegacyManager.CreatePlayer for now)
    console.log("[Main] Spawning player...");
    const player = world.createEntity();
    world.addComponent(player, 'PositionComponent', new PositionComponent(15, 15));
    world.addComponent(player, 'ASCIIRenderComponent', new ASCIIRenderComponent('@', '#FFD700')); // Gold color for player
    world.addComponent(player, 'NeedsComponent', new NeedsComponent());
    world.addComponent(player, 'MicroplasticsComponent', new MicroplasticsComponent(0));
    world.addComponent(player, 'InventoryComponent', new InventoryComponent());
    world.addComponent(player, 'ReputationComponent', new ReputationComponent());

    // Tag the player for easy retrieval by systems
    world.playerEntityId = player;

    // 4c. Helper for GameLoop to find what to render
    world.getRenderableEntities = () => {
        // Naive: get ALL entities with Position + Render.
        // Optimization: Only get those on screen.
        const renderables = [];
        for (const entityId of world.entities) {
            const pos = world.getComponent(entityId, 'PositionComponent');
            const ren = world.getComponent(entityId, 'ASCIIRenderComponent');
            if (pos && ren) {
                renderables.push({ x: pos.x, y: pos.y, tile: ren.tile, color: ren.color });
            }
        }
        return renderables;
    };

    // STEP 5: REGISTER ALL ECS SYSTEMS
    // Order matters slightly: Input/Time first, then Logic, then Output/Cleanup.
    world.registerSystem(new PlayerControlSystem()); // <--- ADD THIS
    world.registerSystem(new TimeSystem());
    world.registerSystem(new AINeedsSystem(moduleManager));
    world.registerSystem(new LieIdleSystem());
    world.registerSystem(new ContagionSystem());
    world.registerSystem(new OwnershipSystem());
    world.registerSystem(new MicroplasticsSystem());
    world.registerSystem(new ReputationSystem());

    // STEP 6: INITIALIZE GAME LOOP
    const gameLoop = new GameLoop(world, renderer);

    // STEP 7: START LOOP
    console.log("[Main] Initialization complete. Starting game loop.");
    gameLoop.start(); document.getElementById('ui-textbox').innerText = "Simulation initialized. WASD/Arrows to move.";
}

// --- ENTRY POINT ---
init();
