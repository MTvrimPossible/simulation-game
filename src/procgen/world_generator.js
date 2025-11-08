/**
 * world_generator.js v3
 * PILLAR 5: RADICAL MODULARITY (Procedural Generation)
 * Generates a zoned city map with WALKABLE roads.
 */

export class WorldGenerator {
    constructor(moduleManager) {
        this.moduleManager = moduleManager;
    }

    createTownMap(width = 80, height = 40) {
        const mapData = Array(height).fill(null).map(() => Array(width).fill('.'));
        const buildingSpawns = [];

        const commercialZone = { startX: 5, endX: 30, tag: 'commercial', color: '#aaf' };
        const residentialZone = { startX: 35, endX: 55, tag: 'residential', color: '#afa' };
        const slumsZone = { startX: 60, endX: 75, tag: 'slums', color: '#999' };
        const zones = [commercialZone, residentialZone, slumsZone];

        // 1. Draw Roads with '=' (Walkable) instead of '#' (Wall)
        const mainRoadY = Math.floor(height / 2);
        for (let x = 1; x < width - 1; x++) mapData[mainRoadY][x] = '=';

        zones.forEach(zone => {
            const roadX = Math.floor((zone.startX + zone.endX) / 2);
            for (let y = 1; y < height - 1; y++) mapData[y][roadX] = '=';
        });

        // 2. Place Buildings
        zones.forEach(zone => {
            for (let i = 0; i < 8; i++) {
                const w = 4, h = 3;
                let bx = zone.startX + Math.floor(Math.random() * (zone.endX - zone.startX - w));
                let by = Math.floor(Math.random() * (height - h - 2)) + 1;

                // Don't build ON the main road
                if (by <= mainRoadY && by + h >= mainRoadY) by += 4;

                this.drawBuilding(mapData, bx, by, w, h);
                buildingSpawns.push({
                    x: bx + Math.floor(w/2),
                    y: by + h,
                    tags: [zone.tag],
                    color: zone.color
                });
            }
        });

        // 3. Border (Actual Walls)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (x===0 || x===width-1 || y===0 || y===height-1) mapData[y][x] = '#';
            }
        }

        return { mapData, buildingSpawns };
    }

    drawBuilding(map, x, y, w, h) {
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                // Ensure we don't draw out of bounds if random placement is tight
                if (map[y+dy] && map[y+dy][x+dx] !== undefined) {
                     map[y+dy][x+dx] = (dy === h-1 && dx === Math.floor(w/2)) ? '+' : '#';
                }
            }
        }
    }
}
