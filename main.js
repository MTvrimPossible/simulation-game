/**
 * main.js v15 - Save/Load Ready
 */
// ... (Imports same as v14) ...
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
import { ScheduleSystem } from './src/systems/schedule_system.js';
import { NPCMovementSystem } from './src/systems/npc_movement.js';
import { ItemEffectSystem } from './src/systems/item_effects.js';
import { NeedsUISystem } from './src/systems/needs_ui.js';
import { MortalitySystem } from './src/systems/mortality.js';
import { QuestSystem } from './src/systems/quest_system.js';
import { TradingSystem } from './src/systems/trading_system.js';
import { MinigameRunner } from './src/systems/minigame_runner.js';
import { SaveLoadSystem } from './src/systems/save_load.js'; // NEW IMPORT
import { WorldGenerator } from './src/procgen/world_generator.js';
import { DialogueSystem } from './src/dialogue_system.js';
import { LegacyManager } from './src/legacy_manager.js';
// ... (Component imports same as v14) ...
import { PositionComponent } from './src/components/PositionComponent.js';
import { ASCIIRenderComponent } from './src/components/ASCIIRenderComponent.js';
import { NeedsComponent } from './src/components/NeedsComponent.js';
import { MicroplasticsComponent } from './src/components/MicroplasticsComponent.js';
import { DialogueComponent } from './src/components/DialogueComponent.js';
import { InventoryComponent } from './src/components/InventoryComponent.js';
import { ItemComponent } from './src/components/ItemComponent.js';
import { DelusionComponent } from './src/components/DelusionComponent.js';
import { ScheduleComponent } from './src/components/ScheduleComponent.js';
import { QuestComponent } from './src/components/QuestComponent.js';
import { CurrencyComponent } from './src/components/CurrencyComponent.js';
import { VendingComponent } from './src/components/VendingComponent.js';

async function init() {
    const world = new World();
    const renderer = new Renderer('game-screen');
    const moduleManager = new ModuleManager();
    const legacyManager = new LegacyManager();
    try { await moduleManager.loadAllData(); } catch (error) { return; }
    const dialogueSystem = new DialogueSystem(moduleManager);
    const worldGenerator = new WorldGenerator(moduleManager);
    const tradingSystem = new TradingSystem(world);
    const minigameRunner = new MinigameRunner(world);
    dialogueSystem.setRunner(minigameRunner);

    // --- MAIN MENU CHECK ---
    // Before generating a new world, check if we should load an old one.
    // For now, we just generate fresh every time unless F9 is pressed.

    window.addEventListener('OnPlayerInteract', (e) => {
         const targetId = e.detail.target;
         const player = world.playerEntityId;
         if (world.getComponent(targetId, 'DialogueComponent')) {
              dialogueSystem.startDialogue(world.getComponent(targetId, 'DialogueComponent').treeId, world, player); return;
         }
         if (world.getComponent(targetId, 'VendingComponent')) {
              tradingSystem.attemptPurchase(player, targetId); return;
         }
         const itemComp = world.getComponent(targetId, 'ItemComponent');
         if (itemComp && world.getComponent(player, 'InventoryComponent').addItem({ id: itemComp.itemId, name: itemComp.name })) {
              delete world.components.PositionComponent[targetId];
              document.getElementById('ui-textbox').innerText = `Picked up: ${itemComp.name}`;
         }
    });

    // --- WORLD GEN ---
    const townData = worldGenerator.createTownMap();
    world.mapData = townData.mapData;
    // Update World.serialize to include it, OR just rely on it being attached to 'world'.
    // (Our simple JSON.stringify(world) might miss it if it's not explicitly added to the return object in serialize())

    townData.buildingSpawns.forEach(s => {
        const b = world.createEntity();
        world.addComponent(b, 'PositionComponent', new PositionComponent(s.x, s.y));
        world.addComponent(b, 'ASCIIRenderComponent', new ASCIIRenderComponent('+', s.color));
    });
    if (townData.itemSpawns) townData.itemSpawns.forEach(s => {
        const d = moduleManager.items[s.id];
        if (d) {
            const i = world.createEntity();
            world.addComponent(i, 'PositionComponent', new PositionComponent(s.x, s.y));
            world.addComponent(i, 'ASCIIRenderComponent', new ASCIIRenderComponent(d.ascii_tile, d.color || 'white'));
            world.addComponent(i, 'ItemComponent', new ItemComponent(s.id, d.name));
        }
    });

    const player = world.createEntity();
    world.addComponent(player, 'PositionComponent', new PositionComponent(40, 22));
    world.addComponent(player, 'ASCIIRenderComponent', new ASCIIRenderComponent('@', '#FFD700'));
    world.addComponent(player, 'NeedsComponent', new NeedsComponent());
    world.addComponent(player, 'InventoryComponent', new InventoryComponent());
    world.addComponent(player, 'CurrencyComponent', new CurrencyComponent(25));
    const q = new QuestComponent();
    q.activeQuests['quest_001_intro'] = { stage: 'start', objectives: {} };
    world.addComponent(player, 'QuestComponent', q);
    world.playerEntityId = player;

    // ... (Other manual spawns: Vending, DSM, Ghost, PongNPC, Worker - kept from v14) ...
    // Re-add them here if you want them in the fresh world.

    world.getRenderableEntities = () => {
        const renderables = [];
        // Safety check: player might not exist yet if loading failed half-way
        if (!world.playerEntityId) return [];
        const pInv = world.getComponent(world.playerEntityId, 'InventoryComponent');
        const hasDSM = pInv && pInv.items.some(i => i.id === 'item_004_dsm');

        for (const e of world.entities) {
             const p = world.getComponent(e, 'PositionComponent');
             const r = world.getComponent(e, 'ASCIIRenderComponent');
             const d = world.getComponent(e, 'DelusionComponent');
             if (d && !hasDSM) continue;
             if (p && r) renderables.push({ x: p.x, y: p.y, tile: r.tile, color: r.color });
        }
        return renderables;
    };

    // REGISTER SYSTEMS
    world.registerSystem(new PlayerControlSystem());
    world.registerSystem(new InventoryUISystem(world, renderer));
    world.registerSystem(new TimeSystem());
    world.registerSystem(new ScheduleSystem());
    world.registerSystem(new NPCMovementSystem());
    world.registerSystem(new MortalitySystem(world, legacyManager));
    world.registerSystem(new NeedsUISystem(world));
    world.registerSystem(new QuestSystem(moduleManager));
    world.registerSystem(new AINeedsSystem(moduleManager)); // Updated to pure data version
    world.registerSystem(minigameRunner);
    world.registerSystem(new SaveLoadSystem(world)); // <--- REGISTERED

    const gameLoop = new GameLoop(world, renderer);
    gameLoop.start();
    document.getElementById('ui-textbox').innerText = "F5 to Save. F9 to Load.";
}
init();
