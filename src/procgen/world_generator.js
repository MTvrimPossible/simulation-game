/**
 * world_generator.js v2
 * PILLAR 5: RADICAL MODULARITY (Procedural Generation)
 * Generates a zoned city map with distinct districts.
 */

export class WorldGenerator {
    constructor(moduleManager) {
        this.moduleManager = moduleManager;
    }

    createTownMap(width = 80, height = 40) {
        const mapData = Array(height).fill(null).map(() => Array(width).fill('.'));
        const buildingSpawns = [];

        // 1. Define Districts (Simple vertical slices for now)
        const commercialZone = { startX: 5, endX: 30, tag: 'commercial', color: '#aaf' };
        const residentialZone = { startX: 35, endX: 55, tag: 'residential', color: '#afa' };
        const slumsZone = { startX: 60, endX: 75, tag: 'slums', color: '#999' };
        const zones = [commercialZone, residentialZone, slumsZone];

        // 2. Draw Roads (Main horizontals, zone verticals)
        const mainRoadY = Math.floor(height / 2);
        for (let x = 0; x < width; x++) mapData[mainRoadY][x] = '#';

        zones.forEach(zone => {
            // Vertical road for each zone
            const roadX = Math.floor((zone.startX + zone.endX) / 2);
            for (let y = 0; y < height; y++) mapData[y][roadX] = '#';
        });

        // 3. Place Buildings in Zones
        zones.forEach(zone => {
            for (let i = 0; i < 8; i++) { // Try to place 8 buildings per zone
                const w = 4, h = 3;
                // Random position within zone, avoiding main roads
                let bx = zone.startX + Math.floor(Math.random() * (zone.endX - zone.startX - w));
                let by = Math.floor(Math.random() * (height - h - 2)) + 1;

                // Don't build ON the main road
                if (by <= mainRoadY && by + h >= mainRoadY) by += 5;

                // "Build" it (mark footprint and save spawn)
                this.drawBuilding(mapData, bx, by, w, h);
                buildingSpawns.push({
                    x: bx + Math.floor(w/2),
                    y: by + h, // Door at bottom
                    tags: [zone.tag],
                    color: zone.color // Save color for renderer
                });
            }
        });

        // 4. Border
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
                if (map[y+dy] && map[y+dy][x+dx]) {
                    map[y+dy][x+dx] = (dy === h-1 && dx === Math.floor(w/2)) ? '+' : '#'; // '+' for door
                }
            }
        }
    }

    // ... createBuildingInterior remains the same ...
}
