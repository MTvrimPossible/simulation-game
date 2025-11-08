/**
 * world_generator.js
 * PILLAR 5: RADICAL MODULARITY (Procedural Generation)
 *
 * Generates both macro-level town maps and micro-level building interiors
 * based on semantic tags rather than hardcoded layouts.
 */

export class WorldGenerator {
    constructor(moduleManager) {
        this.moduleManager = moduleManager;
    }

    /**
     * Generates the high-level town map.
     * @returns {object} { mapData: 2D Array, buildingSpawns: Array<{x, y, tags}> }
     */
    createTownMap(width = 60, height = 40) {
        // 1. Fill with grass/floor ('.')
        const mapData = Array(height).fill(null).map(() => Array(width).fill('.'));
        const buildingSpawns = [];

        // 2. Draw a border so player can't walk off the edge
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                    mapData[y][x] = '#';
                }
            }
        }

        // 3. Place a few specific buildings
        // (In a real PCG system, this would be a loop with random coordinates)
        const buildings = [
            {x: 10, y: 10, tags: ['residential']},
            {x: 40, y: 10, tags: ['commercial', 'bar']},
            {x: 10, y: 30, tags: ['municipal', 'graveyard']},
            {x: 45, y: 32, tags: ['strange']}
        ];

        buildings.forEach(b => {
            // Mark the building on the map
            if (mapData[b.y] && mapData[b.y][b.x]) {
                 mapData[b.y][b.x] = 'B';
                 buildingSpawns.push(b);
            }
        });

        return {
            mapData: mapData,
            buildingSpawns: buildingSpawns
        };
    }

    /**
     * Generates a specific building interior based on semantic tags.
     * @param {Array<string>} tags - E.g., ['residential', 'fridge']
     * @returns {object} { mapData: 2D Array, entitySpawns: Array }
     */
    createBuildingInterior(tags, width = 20, height = 15) {
        // 1. Initialize empty floor
        const mapData = Array(height).fill(null).map(() => Array(width).fill(' '));
        const entitySpawns = [];

        // 2. Draw outer walls
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                    mapData[y][x] = '#';
                } else {
                    mapData[y][x] = '.'; // Floor
                }
            }
        }

        // 3. Add Entrance (always needed)
        const entranceX = Math.floor(width / 2);
        mapData[height - 1][entranceX] = '+'; // Door

        // 4. Place required Furniture based on tags
        let currentX = 2;
        let currentY = 2;

        for (const tag of tags) {
             let itemId = null;
             if (tag === 'fridge') itemId = 'item_003_fridge';
             else if (tag === 'bed') itemId = 'item_011_bed';
             else if (tag === 'sink') itemId = 'item_002_sink';

             if (itemId) {
                 entitySpawns.push({ x: currentX, y: currentY, itemId: itemId });
                 currentX += 3;
                 if (currentX >= width - 2) {
                     currentX = 2;
                     currentY += 3;
                 }
             }
        }

        return {
            mapData: mapData,
            entitySpawns: entitySpawns
        };
    }
}
