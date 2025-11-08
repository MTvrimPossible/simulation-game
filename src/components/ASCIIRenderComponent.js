/**
 * ASCIIRenderComponent.js
 * Data for how an entity appears on the screen.
 */
export class ASCIIRenderComponent {
    constructor(tile = '?', color = 'white') {
        this.tile = tile;   // The character, e.g., '@', 'g', '#'
        this.color = color; // CSS color string, e.g., '#ff0000'
    }
}
