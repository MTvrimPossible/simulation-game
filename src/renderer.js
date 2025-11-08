export class Renderer {
    constructor(targetPreId) {
        this.display = document.getElementById(targetPreId);
    }

    render(mapData, renderables) {
        if (!this.display) return;

        // 1. Create a buffer of OBJECTS, not just strings, so we can hold color data
        const height = mapData.length;
        const width = mapData[0].length;
        const buffer = Array(height).fill(null)
            .map((_, y) => mapData[y].map(tile => ({ char: tile, color: null })));

        // 2. Stamp entities onto the buffer
        for (const entity of renderables) {
            if (buffer[entity.y] && buffer[entity.y][entity.x]) {
                buffer[entity.y][entity.x] = {
                    char: entity.tile,
                    color: entity.color || 'white'
                };
            }
        }

        // 3. Convert buffer to HTML string
        let outputHTML = '';
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = buffer[y][x];
                // Only add a <span> if it has a specific color, optimization for DOM
                if (cell.color) {
                    outputHTML += `<span style="color: ${cell.color};">${cell.char}</span>`;
                } else {
                    outputHTML += cell.char;
                }
            }
            outputHTML += '\n';
        }

        this.display.innerHTML = outputHTML;
    }
}
