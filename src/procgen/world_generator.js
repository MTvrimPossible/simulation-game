/**
 * world_generator.js v4
 * PILLAR 5: RADICAL MODULARITY (Procedural Generation)
 * Generates a clean, navigable city with no overlaps.
 */

export class WorldGenerator {
    constructor(moduleManager) {
        this.moduleManager = moduleManager;
    }

    createTownMap(width = 80, height = 40) {
        // Fill with grass '.'
        const mapData = Array(height).fill(null).map(() => Array(width).fill('.'));
        const buildingSpawns = [];

        // 1. Draw MAIN ROADS (The Skeleton)
        const midY = Math.floor(height / 2);
        const midX = Math.floor(width / 2);

        // Horizontal main road
        for (let x = 1; x < width - 1; x++) mapData[midY][x] = '=';
        for (let x = 1; x < width - 1; x++) mapData[midY+1][x] = '='; // Double wide for clarity

        // Vertical main road
        for (let y = 1; y < height - 1; y++) mapData[y][midX] = '=';
        for (let y = 1; y < height - 1; y++) mapData[y][midX+1] = '=';

        // 2. Define Zones relative to the skeleton
        const zones = [
            { tag: 'commercial', color: '#aaf', x1: 2, y1: 2, x2: midX - 2, y2: midY - 2 },     // Top Left
            { tag: 'residential', color: '#afa', x1: midX + 4, y1: 2, x2: width - 3, y2: midY - 2 }, // Top Right
            { tag: 'slums', color: '#999', x1: 2, y1: midY + 4, x2: midX - 2, y2: height - 3 }   // Bottom Left
        ];

        // 3. Place buildings CAREFULLY
        zones.forEach(zone => {
            let attempts = 0;
            let buildingsPlaced = 0;
            while (buildingsPlaced < 6 && attempts < 100) {
                attempts++;
                const w = 5, h = 4;
                const bx = Math.floor(Math.random() * (zone.x2 - zone.x1 - w)) + zone.x1;
                const by = Math.floor(Math.random() * (zone.y2 - zone.y1 - h)) + zone.y1;

                if (this.isAreaClear(mapData, bx - 1, by - 1, w + 2, h + 2)) { // Check with 1-tile buffer
                    this.drawBuilding(mapData, bx, by, w, h);
                    buildingSpawns.push({
                        x: bx + Math.floor(w / 2),
                        y: by + h,
                        tags: [zone.tag],
                        color: zone.color
                    });
                    buildingsPlaced++;
                }
            }
        });

        // 4. Outer Walls
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (x === 0 || x === width - 1 || y === 0 || y === height - 1) mapData[y][x] = '#';
            }
        }

        return { mapData, buildingSpawns };
    }

    isAreaClear(map, x, y, w, h) {
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                if (!map[y + dy] || map[y + dy][x + dx] !== '.') return false;
            }
        }
        return true;
    }

    drawBuilding(map, x, y, w, h) {
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                map[y + dy][x + dx] = (dy === h - 1 && dx === Math.floor(w / 2)) ? '+' : '#';
            }
        }
    }
}
