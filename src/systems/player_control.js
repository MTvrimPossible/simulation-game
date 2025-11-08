/**
 * player_control.js
 * PILLAR 3: SYSTEMIC INTERACTIONS (Input Processing)
 *
 * Translates raw input actions from the GameLoop into actual
 * component changes (movement, interaction) for the player entity.
 */

import { System } from '../ecs.js';

export class PlayerControlSystem extends System {
    constructor() {
        super();
        this.requiredComponents = ['PositionComponent'];
    }

    update(world, entities, turns_passed) {
        const action = world.latestAction;
        if (!action) return;

        // We only want to move the player, not every entity with a position.
        // We use the tag we added to 'world' in main.js
        const playerID = world.playerEntityId;
        if (!playerID) return;

        const pos = world.getComponent(playerID, 'PositionComponent');
        if (!pos) return;

        // Calculate intended new position
        let newX = pos.x;
        let newY = pos.y;

        switch (action) {
            case 'MOVE_UP': newY--; break;
            case 'MOVE_DOWN': newY++; break;
            case 'MOVE_LEFT': newX--; break;
            case 'MOVE_RIGHT': newX++; break;
            case 'WAIT': /* Just pass time */ break;
            default: return; // Not a movement action
        }

        // COLLISION CHECK (Naive)
        // In a real engine, we'd check a CollisionMap here.
        // For now, just check map bounds based on the world's current map data.
        const map = world.getCurrentMap();
        if (newY >= 0 && newY < map.length && newX >= 0 && newX < map[0].length) {
             const tile = map[newY][newX];
             if (tile !== '#') { // '#' is our basic wall/road for now depending on generation
                 pos.x = newX;
                 pos.y = newY;
                 // console.log(`Player moved to ${pos.x}, ${pos.y}`);
             } else {
                 // console.log("Blocked by wall.");
             }
        }
    }
}
