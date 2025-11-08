import { System } from '../ecs.js';

export class NPCMovementSystem extends System {
    constructor() {
        super();
        this.requiredComponents = ['PositionComponent', 'DestinationComponent'];
    }

    update(world, entities, turns_passed) {
        if (turns_passed <= 0) return;

        const map = world.getCurrentMap();

        for (const entityId of entities) {
            const pos = world.getComponent(entityId, 'PositionComponent');
            const dest = world.getComponent(entityId, 'DestinationComponent');

            // Reached destination?
            if (pos.x === dest.x && pos.y === dest.y) {
                // Remove component when arrived
                delete world.components.DestinationComponent[entityId];
                continue;
            }

            // Extremely naive pathfinding (straight line)
            // In a real game, use A* or Dijkstra.
            let nextX = pos.x;
            let nextY = pos.y;

            if (pos.x < dest.x) nextX++;
            else if (pos.x > dest.x) nextX--;
            
            if (pos.y < dest.y) nextY++;
            else if (pos.y > dest.y) nextY--;

            // Simple collision check against walls ONLY (NPCs can ghost through each other for now)
            if (map[nextY][nextX] !== '#') {
                pos.x = nextX;
                pos.y = nextY;
            } else {
                // Stuck against a wall. In naive movement, they just stop.
                // A real pathfinder would go around.
            }
        }
    }
}
