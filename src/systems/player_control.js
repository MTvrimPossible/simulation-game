import { System } from '../ecs.js';

export class PlayerControlSystem extends System {
    constructor() {
        super();
        this.requiredComponents = ['PositionComponent'];
    }

    update(world, entities, turns_passed) {
        const action = world.latestAction;
        if (!action) return;

        const playerID = world.playerEntityId;
        if (!playerID) return;

        const pos = world.getComponent(playerID, 'PositionComponent');
        if (!pos) return;

        let newX = pos.x;
        let newY = pos.y;

        switch (action) {
            case 'MOVE_UP': newY--; break;
            case 'MOVE_DOWN': newY++; break;
            case 'MOVE_LEFT': newX--; break;
            case 'MOVE_RIGHT': newX++; break;
            default: return;
        }

        // 1. WALL CHECK
        const map = world.getCurrentMap();
        if (!map || newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length || map[newY][newX] === '#') {
             return; // Blocked by map edge or wall
        }

        // 2. ENTITY CHECK (COLLISION)
        let bumpedEntity = null;

        // Iterate ALL entities in the world to see if anyone is at [newX, newY]
        for (let i = 0; i < world.entities.length; i++) {
            const otherId = world.entities[i];
            if (otherId === playerID) continue; // Ignore self

            const otherPos = world.getComponent(otherId, 'PositionComponent');
            // Strict check: must have position, and coordinates must match exactly
            if (otherPos && otherPos.x === newX && otherPos.y === newY) {
                bumpedEntity = otherId;
                break;
            }
        }

        if (bumpedEntity) {
            console.log(`[PlayerControl] BUMP! Player hit Entity ${bumpedEntity}`);
            // Dispatch interaction event
            window.dispatchEvent(new CustomEvent('OnPlayerInteract', {
                detail: { player: playerID, target: bumpedEntity }
            }));
            return; // Do not move into the occupied space
        }

        // 3. APPLY MOVE
        pos.x = newX;
        pos.y = newY;
    }
}
