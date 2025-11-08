/**
 * main.js v14 - Minigames
 */
import { World } from './src/ecs.js';
import { Renderer } from './src/renderer.js';
import { ModuleManager } from './src/module_manager.js';
import { GameLoop } from './src/game_loop.js';
import { PlayerControlSystem } from './src/systems/player_control.js';
import { TimeSystem } from './src/systems/time_system.js';
import { AINeedsSystem } from './src/systems/ai_needs.js';
import { InventoryUISystem } from './src/systems/inventory_ui.js';
import { ScheduleSystem } from './src/systems/schedule_system.js';
import { NPCMovementSystem } from './src/systems/npc_movement.js';
import { ItemEffectSystem } from './src/systems/item_effects.js';
import { NeedsUISystem } from './src/systems/needs_ui.js';
import { MortalitySystem } from './src/systems/mortality.js';
import { QuestSystem } from './src/systems/quest_system.js';
import { TradingSystem } from './src/systems/trading_system.js';
import { MinigameRunner } from './src/systems/minigame_runner.js'; // NEW
import { WorldGenerator } from './src/procgen/world_generator.js';
import { DialogueSystem } from './src/dialogue_system.js';
import { LegacyManager } from './src/legacy_manager.js';
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

class ReputationComponent { constructor() { this.value = 0; } }

async function init() {
    const world = new World();
    const renderer = new Renderer('game-screen');
    const moduleManager = new ModuleManager();
    const legacyManager = new LegacyManager();
    try { await moduleManager.loadAllData(); } catch (error) { return; }
    const dialogueSystem = new DialogueSystem(moduleManager);
    const worldGenerator = new WorldGenerator(moduleManager);
    const tradingSystem = new TradingSystem(world);
    const minigameRunner = new MinigameRunner(world); // NEW

    // Inject runner into dialogue system so it can trigger games
    dialogueSystem.setRunner(minigameRunner);

    window.addEventListener('OnPlayerInteract', (e) => {
        const targetId = e.detail.target;
        const player = world.playerEntityId;
        if (world.getComponent(targetId, 'DialogueComponent')) {
             dialogueSystem.startDialogue(world.getComponent(targetId, 'DialogueComponent').treeId, world, player);
             return;
        }
        if (world.getComponent(targetId, 'VendingComponent')) {
             tradingSystem.attemptPurchase(player, targetId);
             return;
        }
        const itemComp = world.getComponent(targetId, 'ItemComponent');
        if (itemComp && world.getComponent(player, 'InventoryComponent').addItem({ id: itemComp.itemId, name: itemComp.name })) {
             delete world.components.PositionComponent[targetId];
             document.getElementById('ui-textbox').innerText = `Picked up: ${itemComp.name}`;
        }
    });

    const townData = worldGenerator.createTownMap();
    world.getCurrentMap = () => townData.mapData;
    townData.buildingSpawns.forEach(s => {
        const b = world.createEntity();
        world.addComponent(b, 'PositionComponent', new PositionComponent(s.x, s.y));
        world.addComponent(b, 'ASCIIRenderComponent', new ASCIIRenderComponent('+', s.color));
    });
    // (Item spawns omitted for brevity, re-add if needed from v13)

    const player = world.createEntity();
    world.addComponent(player, 'PositionComponent', new PositionComponent(40, 22));
    world.addComponent(player, 'ASCIIRenderComponent', new ASCIIRenderComponent('@', '#FFD700'));
    world.addComponent(player, 'NeedsComponent', new NeedsComponent());
    world.addComponent(player, 'InventoryComponent', new InventoryComponent());
    world.addComponent(player, 'CurrencyComponent', new CurrencyComponent(25));
    world.playerEntityId = player;

    // PONG MASTER NPC
    const pongNpc = world.createEntity();
    world.addComponent(pongNpc, 'PositionComponent', new PositionComponent(38, 22));
    world.addComponent(pongNpc, 'ASCIIRenderComponent', new ASCIIRenderComponent('P', 'magenta'));
    world.addComponent(pongNpc, 'DialogueComponent', new DialogueComponent('D_Debug')); // Uses the new Pong dialogue

    world.getRenderableEntities = () => {
        const renderables = [];
        for (const e of world.entities) {
             const p = world.getComponent(e, 'PositionComponent');
             const r = world.getComponent(e, 'ASCIIRenderComponent');
             if (p && r) renderables.push({ x: p.x, y: p.y, tile: r.tile, color: r.color });
        }
        return renderables;
    };

    world.registerSystem(new PlayerControlSystem());
    world.registerSystem(new InventoryUISystem(world, renderer));
    world.registerSystem(new TimeSystem());
    world.registerSystem(new ScheduleSystem());
    world.registerSystem(new NPCMovementSystem());
    world.registerSystem(new MortalitySystem(world, legacyManager));
    world.registerSystem(new NeedsUISystem(world));
    world.registerSystem(minigameRunner); // Register, though it doesn't strictly need an update loop

    const gameLoop = new GameLoop(world, renderer);
    gameLoop.start();
    document.getElementById('ui-textbox').innerText = "Bump the Magenta 'P' to play Pong.";
}
init();
