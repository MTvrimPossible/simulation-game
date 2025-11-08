/**
 * main.js
 * THE INTEGRATOR - v2 DEBUG
 */

// --- 1. MODULE IMPORTS ---
import { World } from './src/ecs.js';
import { Renderer } from './src/renderer.js';
import { ModuleManager } from './src/module_manager.js';
import { GameLoop } from './src/game_loop.js';

// Systems
import { PlayerControlSystem } from './src/systems/player_control.js';
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

// Components
import { PositionComponent } from './src/components/PositionComponent.js';
import { ASCIIRenderComponent } from './src/components/ASCIIRenderComponent.js';
import { NeedsComponent } from './src/components/NeedsComponent.js';
import { MicroplasticsComponent } from './src/components/MicroplasticsComponent.js';
// CRITICAL IMPORT:
import { DialogueComponent } from './src/components/DialogueComponent.js';

// Stubs
class InventoryComponent { constructor() { this.items = []; } }
class ReputationComponent { constructor() { this.value = 0; } }

// --- MAIN INITIALIZATION ---
async function init() {
    console.log("[Main] Beginning initialization sequence...");

    const world = new World();
    const renderer = new Renderer('game-screen');
    const moduleManager = new ModuleManager();

    try {
        await moduleManager.loadAllData();
    } catch (error) {
        console.error("FATAL: Could not load game data.", error);
        document.getElementById('ui-textbox').innerText = "FATAL ERROR: Could not load game data. Check console (F12).";
        return;
    }

    const dialogueSystem = new DialogueSystem(moduleManager);
    const worldGenerator = new WorldGenerator(moduleManager);
    // const legacyManager = new LegacyManager(); // Unused for now

    // --- DEBUG EVENT WIRING ---
    window.addEventListener('OnPlayerInteract', (e) => {
        // --- START DEBUG BLOCK ---
        console.log("[Main] Event DETECTED:", e.detail);

        const targetId = e.detail.target;
        const dialogueComp = world.getComponent(targetId, 'DialogueComponent');

        console.log(`[Main] Checking Entity ${targetId} for DialogueComponent... Result:`, dialogueComp);

        if (dialogueComp) {
             console.log(`[Main] SUCCESS. Starting dialogue tree: '${dialogueComp.treeId}'`);
             dialogueSystem.startDialogue(dialogueComp.treeId, world, world.playerEntityId);
        } else {
             console.warn("[Main] FAILURE. Target has no DialogueComponent.");
        }
        // --- END DEBUG BLOCK ---
    });

    // --- WORLD GEN ---
    console.log("[Main] Generating world...");
    const townData = worldGenerator.createTownMap();
    world.getCurrentMap = () => townData.mapData;

    townData.buildingSpawns.forEach(spawn => {
        const building = world.createEntity();
        world.addComponent(building, 'PositionComponent', new PositionComponent(spawn.x, spawn.y));
        world.addComponent(building, 'ASCIIRenderComponent', new ASCIIRenderComponent('B', '#555555'));
    });

    // --- PLAYER GEN ---
    console.log("[Main] Spawning player...");
    const player = world.createEntity();
    world.addComponent(player, 'PositionComponent', new PositionComponent(15, 15));
    world.addComponent(player, 'ASCIIRenderComponent', new ASCIIRenderComponent('@', '#FFD700'));
    world.addComponent(player, 'NeedsComponent', new NeedsComponent());
    world.addComponent(player, 'MicroplasticsComponent', new MicroplasticsComponent(0));
    world.addComponent(player, 'InventoryComponent', new InventoryComponent());
    world.addComponent(player, 'ReputationComponent', new ReputationComponent());
    world.playerEntityId = player;

    // --- NPC GEN (DEBUG NPC) ---
    console.log("[Main] Spawning Debug NPC...");
    const npc = world.createEntity();
    world.addComponent(npc, 'PositionComponent', new PositionComponent(18, 15));
    world.addComponent(npc, 'ASCIIRenderComponent', new ASCIIRenderComponent('D', 'cyan'));
    world.addComponent(npc, 'DialogueComponent', new DialogueComponent('D_Debug'));

    // --- RENDER HELPER ---
    world.getRenderableEntities = () => {
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

    // --- REGISTER SYSTEMS ---
    world.registerSystem(new PlayerControlSystem());
    world.registerSystem(new TimeSystem());
    world.registerSystem(new AINeedsSystem(moduleManager));
    world.registerSystem(new LieIdleSystem());
    world.registerSystem(new ContagionSystem());
    world.registerSystem(new OwnershipSystem());
    world.registerSystem(new MicroplasticsSystem());
    world.registerSystem(new ReputationSystem());

    // --- START ---
    const gameLoop = new GameLoop(world, renderer);
    console.log("[Main] Starting loop.");
    gameLoop.start();

    document.getElementById('ui-textbox').innerText = "Simulation initialized. Bump into 'D' to talk.";
}

init();
