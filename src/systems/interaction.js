import { System } from '../ecs.js';

export class InteractionSystem extends System {
    constructor(world, dialogueSystem) {
        super();
        this.world = world;
        this.dialogueSystem = dialogueSystem;
        // We listen for 'BUMP' actions that didn't result in movement
        this.requiredComponents = ['PositionComponent'];
    }

    // This isn't a standard update loop system.
    // It's better called explicitly by PlayerControl when a move is blocked by an entity.
    // BUT for simplicity, let's have PlayerControl dispatch an event.
    // REVISION: Let's make it simple. PlayerControl will call this directly if it hits something.
}

// ACTUALLY, let's revise PlayerControl to handle the bump detection first.
// It's cleaner than a separate full system right now.
