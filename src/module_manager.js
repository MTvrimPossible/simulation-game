/**
 * module_manager.js
 * PILLAR 1: DATA-DRIVEN
 *
 * This module is responsible for asynchronously loading ALL external JSON data.
 * It acts as the single source of truth for game definitions.
 */

export class ModuleManager {
    constructor() {
        // Internal databases for loaded content
        this.items = {};
        this.npcs = {};
        this.dialogue = {};
        // Add more databases here as the game grows (e.g., maps, quests)
    }

    /**
     * Critical function: Loads all JSON data concurrently.
     * The game cannot start until this promise resolves.
     */
    async loadAllData() {
        console.log("ModuleManager: Loading external data...");

        try {
            // Define all load operations.
            // We use fetch() to get the raw file, then .json() to parse it.
            // We wrap these in Promise.all to run them in parallel.
            const [itemsData, npcsData, dialogueData] = await Promise.all([
                fetch('./data/items.json').then(resp => {
                    if (!resp.ok) throw new Error(`HTTP error ${resp.status} on items.json`);
                    return resp.json();
                }),
                fetch('./data/npcs.json').then(resp => {
                    if (!resp.ok) throw new Error(`HTTP error ${resp.status} on npcs.json`);
                    return resp.json();
                }),
                 fetch('./data/dialogue.json').then(resp => {
                    if (!resp.ok) throw new Error(`HTTP error ${resp.status} on dialogue.json`);
                    return resp.json();
                })
            ]);

            // Populate internal databases with the loaded data
            this.items = itemsData;
            this.npcs = npcsData;
            this.dialogue = dialogueData;

            console.log("ModuleManager: All data loaded successfully.");
            return true;

        } catch (error) {
            // PILLAR 5 (Modularity) requires we fail gracefully but loudly if data is missing.
            console.error("CRITICAL ERROR: Failed to load game data.", error);
            // Re-throw so the main game loop knows to abort.
            throw new Error('Failed to load critical game data: ' + error.message);
        }
    }

    // --- Helper Accessors (Optional but good practice) ---

    getItem(id) {
        return this.items[id];
    }

    getNPC(id) {
        return this.npcs[id];
    }
}
