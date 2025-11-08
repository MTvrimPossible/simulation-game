/**
 * renderer.js
 * PILLAR 3: ASCETICISM AS FOCUS
 *
 * A "dumb" renderer that strictly converts 2D data arrays into DOM text strings.
 * It knows nothing of game logic, only coordinates and characters.
 */

export class Renderer {
    /**
     * @param {string} targetPreId - The ID of the <pre> tag to render into.
     */
    constructor(targetPreId) {
        this.display = document.getElementById(targetPreId);
        if (!this.display) {
            console.error(`Renderer: Could not find target element '#${targetPreId}'`);
        }
    }

    /**
     * Main render routine.
     * @param {Array<Array<string>>} mapData - 2D array of base map tiles.
     * @param {Array<object>} renderables - Objects with {x, y, tile} properties.
     */
    render(mapData, renderables) {
        if (!this.display) return;

        // 1. Create a deep copy of the map to avoid mutating actual game state.
        // We use .map(row => [...row]) for a fast 2D array copy.
        const buffer = mapData.map(row => [...row]);

        // 2. Stamp entities onto the buffer
        // We render entities *over* the map tiles.
        for (const entity of renderables) {
            // Basic bounds checking to prevent crashes if an entity moves off-map
            if (buffer[entity.y] && buffer[entity.y][entity.x] !== undefined) {
                buffer[entity.y][entity.x] = entity.tile;
            }
        }

        // 3. Convert 2D buffer to a single string
        // Join columns into strings, then join rows with newlines.
        const outputString = buffer.map(row => row.join('')).join('\n');

        // 4. Flush to the DOM
        this.display.innerHTML = outputString;
    }

    /**
     * Utility to clear the screen if needed between states.
     */
    clear() {
        if (this.display) this.display.innerHTML = '';
    }
}
