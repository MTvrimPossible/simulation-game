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
    createTownMap(width = 50, height = 30) {
        // 1. Initialize blank map with grass/terrain
        const mapData = Array(height).fill(null).map(() => Array(width).fill('.'));
        const buildingSpawns = [];

        // 2. Simple Road Generation (Grid-like for now)
        const roadIntervalX = 15;
        const roadIntervalY = 10;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (x % roadIntervalX === 0 || y % roadIntervalY === 0) {
                    mapData[y][x] = '#'; // Road Character
                }
            }
        }

        // 3. Place Buildings in the 'blocks' between roads
        // Naive placement: finds empty spots and places a 'Building Marker'
        for (let y = 2; y < height - 2; y += 5) {
            for (let x = 2; x < width - 2; x += 5) {
                // Check if this spot is roughly in the middle of a block
                if (mapData[y][x] === '.') {
                    // Mark on map
                    mapData[y][x] = 'B';

                    // Define what kind of building this is via tags.
                    // In a real implementation, this would be randomized based on districts.
                    buildingSpawns.push({
                        x: x,
                        y: y,
                        tags: ['residential', 'fridge', 'bed', 'sink']
                        // Other examples: ['commercial', 'pizza_oven', 'register']
                    });
                }
            }
        }

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
        // This is a very naive "find first empty spot" placer.
        // A better version would use 'rooms' or predefined slots.
        let currentX = 2;
        let currentY = 2;

        for (const tag of tags) {
             // Determine which item ID corresponds to this tag
             // In a real system, this would query ModuleManager.
             let itemId = null;
             if (tag === 'fridge') itemId = 'item_003_fridge';
             else if (tag === 'bed') itemId = 'item_011_bed';
             else if (tag === 'sink') itemId = 'item_002_sink';

             if (itemId) {
                 // Place it and advance cursor
                 entitySpawns.push({ x: currentX, y: currentY, itemId: itemId });
                 // Visualize it on the map purely for debugging the generator,
                 // though the actual game relies on Entities for this.
                 // mapData[currentY][currentX] = '?';

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
