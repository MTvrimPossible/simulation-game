// main.js - v7 (Schedules & Movement)
import { World } from './src/ecs.js';
import { Renderer } from './src/renderer.js';
import { ModuleManager } from './src/module_manager.js';
import { GameLoop } from './src/game_loop.js';
import { PlayerControlSystem } from './src/systems/player_control.js';
import { TimeSystem } from './src/systems/time_system.js';
import { AINeedsSystem } from './src/systems/ai_needs.js';
import { LieIdleSystem } from './src/systems/lie_idle.js';
import { ContagionSystem } from './src/systems/contagion.js';
import { OwnershipSystem } from './src/systems/ownership.js';
import { MicroplasticsSystem } from './src/systems/entropy.js';
import { ReputationSystem } from './src/systems/reputation.js';
import { InventoryUISystem } from './src/systems/inventory_ui.js';
import { WorldGenerator } from './src/procgen/world_generator.js';
import { DialogueSystem } from './src/dialogue_system.js';
import { PositionComponent } from './src/components/PositionComponent.js';
import { ASCIIRenderComponent } from './src/components/ASCIIRenderComponent.js';
import { NeedsComponent } from './src/components/NeedsComponent.js';
import { MicroplasticsComponent } from './src/components/MicroplasticsComponent.js';
import { DialogueComponent } from './src/components/DialogueComponent.js';
import { InventoryComponent } from './src/components/InventoryComponent.js';
import { ItemComponent } from './src/components/ItemComponent.js';
import { DelusionComponent } from './src/components/DelusionComponent.js';
// NEW IMPORTS
import { ScheduleComponent } from './src/components/ScheduleComponent.js';
import { ScheduleSystem } from './src/systems/schedule_system.js';
import { NPCMovementSystem } from './src/systems/npc_movement.js';
import { DestinationComponent } from './src/components/DestinationComponent.js'; // Needed for manual testing if desired

async function init() {
    const world = new World();
    const renderer = new Renderer('game-screen');
    const moduleManager = new ModuleManager();
    try { await moduleManager.loadAllData(); } catch (error) { return; }
    const dialogueSystem = new DialogueSystem(moduleManager);
    const worldGenerator = new WorldGenerator(moduleManager);

    window.addEventListener('OnPlayerInteract', (e) => {
        const targetId = e.detail.target;
        const player = world.playerEntityId;
        const dialogueComp = world.getComponent(targetId, 'DialogueComponent');
        if (dialogueComp) { dialogueSystem.startDialogue(dialogueComp.treeId, world, player); return; }
        const itemComp = world.getComponent(targetId, 'ItemComponent');
        if (itemComp && world.getComponent(player, 'InventoryComponent').addItem({ id: itemComp.itemId, name: itemComp.name })) {
             delete world.components.PositionComponent[targetId];
             document.getElementById('ui-textbox').innerText = `Picked up: ${itemComp.name}`;
             window.dispatchEvent(new CustomEvent('OnPickupItem', { detail: { entityId: player, item: itemComp } }));
        }
    });

    const townData = worldGenerator.createTownMap();
    world.getCurrentMap = () => townData.mapData;
    townData.buildingSpawns.forEach(s => {
        const b = world.createEntity();
        world.addComponent(b, 'PositionComponent', new PositionComponent(s.x, s.y));
        world.addComponent(b, 'ASCIIRenderComponent', new ASCIIRenderComponent('B', '#555555'));
    });

    const player = world.createEntity();
    world.addComponent(player, 'PositionComponent', new PositionComponent(15, 15));
    world.addComponent(player, 'ASCIIRenderComponent', new ASCIIRenderComponent('@', '#FFD700'));
    world.addComponent(player, 'NeedsComponent', new NeedsComponent());
    world.addComponent(player, 'MicroplasticsComponent', new MicroplasticsComponent(0));
    world.addComponent(player, 'InventoryComponent', new InventoryComponent());
    world.playerEntityId = player;

    // --- SCHEDULED WORKER NPC ---
    const worker = world.createEntity();
    world.addComponent(worker, 'PositionComponent', new PositionComponent(5, 5));
    world.addComponent(worker, 'ASCIIRenderComponent', new ASCIIRenderComponent('W', 'orange'));
    world.addComponent(worker, 'ScheduleComponent', new ScheduleComponent({
        "0900": { "action": "moveTo", "target": { "x": 40, "y": 10 } }, // Commute to work at 9 AM
        "1700": { "action": "moveTo", "target": { "x": 5, "y": 5 } }   // Commute home at 5 PM
    }));

    world.getRenderableEntities = () => {
        const renderables = [];
        const hasDSM = world.getComponent(world.playerEntityId, 'InventoryComponent').items.some(i => i.id === 'item_004_dsm');
        for (const e of world.entities) {
            const p = world.getComponent(e, 'PositionComponent');
            const r = world.getComponent(e, 'ASCIIRenderComponent');
            const d = world.getComponent(e, 'DelusionComponent');
            if (d && !hasDSM) continue;
            if (p && r) renderables.push({ x: p.x, y: p.y, tile: r.tile, color: r.color });
        }
        return renderables;
    };

    world.registerSystem(new PlayerControlSystem());
    world.registerSystem(new InventoryUISystem(world, renderer));
    world.registerSystem(new TimeSystem());
    world.registerSystem(new ScheduleSystem()); // <--- NEW
    world.registerSystem(new NPCMovementSystem()); // <--- NEW
    world.registerSystem(new AINeedsSystem(moduleManager));
    // ... other passive systems ...

    const gameLoop = new GameLoop(world, renderer);
    gameLoop.start();
    document.getElementById('ui-textbox').innerText = "Wait until 09:00 to see the Worker (W) commute.";
}
init();
