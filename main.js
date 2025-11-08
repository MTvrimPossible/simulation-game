// main.js - v6 (Delusions Ready)
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
import { DelusionComponent } from './src/components/DelusionComponent.js'; // NEW IMPORT

class ReputationComponent { constructor() { this.value = 0; } }

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
        if (itemComp) {
            const inventory = world.getComponent(player, 'InventoryComponent');
            if (inventory && inventory.addItem({ id: itemComp.itemId, name: itemComp.name })) {
                 delete world.components.PositionComponent[targetId];
                 document.getElementById('ui-textbox').innerText = `Picked up: ${itemComp.name}`;
                 window.dispatchEvent(new CustomEvent('OnPickupItem', { detail: { entityId: player, item: itemComp } }));
            } else { document.getElementById('ui-textbox').innerText = "Inventory full."; }
        }
    });

    const townData = worldGenerator.createTownMap();
    world.getCurrentMap = () => townData.mapData;
    townData.buildingSpawns.forEach(spawn => {
        const b = world.createEntity();
        world.addComponent(b, 'PositionComponent', new PositionComponent(spawn.x, spawn.y));
        world.addComponent(b, 'ASCIIRenderComponent', new ASCIIRenderComponent('B', '#555555'));
    });

    const player = world.createEntity();
    world.addComponent(player, 'PositionComponent', new PositionComponent(15, 15));
    world.addComponent(player, 'ASCIIRenderComponent', new ASCIIRenderComponent('@', '#FFD700'));
    world.addComponent(player, 'NeedsComponent', new NeedsComponent());
    world.addComponent(player, 'MicroplasticsComponent', new MicroplasticsComponent(0));
    world.addComponent(player, 'InventoryComponent', new InventoryComponent());
    world.addComponent(player, 'ReputationComponent', new ReputationComponent());
    world.playerEntityId = player;

    const npc = world.createEntity();
    world.addComponent(npc, 'PositionComponent', new PositionComponent(18, 15));
    world.addComponent(npc, 'ASCIIRenderComponent', new ASCIIRenderComponent('D', 'cyan'));
    world.addComponent(npc, 'DialogueComponent', new DialogueComponent('D_Debug'));

    // --- DELUSION ENTITIES ---
    // 1. The DSM Manual itself (needs to be picked up to see delusions)
    const dsmItem = world.createEntity();
    world.addComponent(dsmItem, 'PositionComponent', new PositionComponent(20, 20));
    world.addComponent(dsmItem, 'ASCIIRenderComponent', new ASCIIRenderComponent('M', 'red'));
    world.addComponent(dsmItem, 'ItemComponent', new ItemComponent('item_004_dsm', 'DSM Manual'));

    // 2. A Delusion (Invisible without manual)
    const ghost = world.createEntity();
    world.addComponent(ghost, 'PositionComponent', new PositionComponent(22, 22));
    world.addComponent(ghost, 'ASCIIRenderComponent', new ASCIIRenderComponent('G', '#ff00ffaa')); // Transparent purple
    world.addComponent(ghost, 'DelusionComponent', new DelusionComponent());
    // Give it dialogue so we know when we found it
    world.addComponent(ghost, 'DialogueComponent', new DialogueComponent('D_Guest'));

    world.getRenderableEntities = () => {
        const renderables = [];
        // Check if player has DSM
        const inv = world.getComponent(world.playerEntityId, 'InventoryComponent');
        const hasDSM = inv && inv.items.some(i => i.id === 'item_004_dsm');

        for (const entityId of world.entities) {
            const pos = world.getComponent(entityId, 'PositionComponent');
            const ren = world.getComponent(entityId, 'ASCIIRenderComponent');
            const del = world.getComponent(entityId, 'DelusionComponent');

            // DELUSION CHECK LOGIC
            if (del && !hasDSM) continue;

            if (pos && ren) {
                renderables.push({ x: pos.x, y: pos.y, tile: ren.tile, color: ren.color });
            }
        }
        return renderables;
    };

    world.registerSystem(new PlayerControlSystem());
    world.registerSystem(new InventoryUISystem(world, renderer));
    world.registerSystem(new TimeSystem());
    world.registerSystem(new AINeedsSystem(moduleManager));
    world.registerSystem(new LieIdleSystem());
    world.registerSystem(new ContagionSystem());
    world.registerSystem(new OwnershipSystem());
    world.registerSystem(new MicroplasticsSystem());
    world.registerSystem(new ReputationSystem());

    const gameLoop = new GameLoop(world, renderer);
    gameLoop.start();
    document.getElementById('ui-textbox').innerText = "Find the Red Manual (M) to see the unseen.";
}
init();
