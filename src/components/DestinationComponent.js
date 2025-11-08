/**
 * DestinationComponent.js
 * The target coordinates an entity is trying to reach.
 * Used by pathfinding/movement systems.
 */
export class DestinationComponent {
    constructor(x = null, y = null) {
        this.x = x;
        this.y = y;
    }
}
