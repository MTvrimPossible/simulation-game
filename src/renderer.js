export class Renderer {
    constructor(id) { this.display = document.getElementById(id); }
    render(map, ents) {
        if (!this.display) return;
        const h = map.length, w = map[0].length;
        const buf = Array(h).fill(null).map((_, y) => map[y].map(t => ({ c: t, col: null })));
        for (const e of ents) { if (buf[e.y] && buf[e.y][e.x]) buf[e.y][e.x] = { c: e.tile, col: e.color || 'white' }; }
        let html = '';
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const cell = buf[y][x];
                html += cell.col ? `<span style="color: ${cell.col};">${cell.c}</span>` : cell.c;
            }
            html += '\n';
        }
        this.display.innerHTML = html;
    }
}
