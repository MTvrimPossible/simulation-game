/**
 * module_manager.js
 */
export class ModuleManager {
    constructor() {
        this.items = {};
        this.npcs = {};
        this.dialogue = {};
        this.quests = {};
    }

    async loadAllData() {
        console.log("ModuleManager: Loading external data...");
        try {
            const [items, npcs, dialogue, quests] = await Promise.all([
                fetch('./data/items.json').then(r => { if (!r.ok) throw new Error('items.json missing'); return r.json(); }),
                fetch('./data/npcs.json').then(r => { if (!r.ok) throw new Error('npcs.json missing'); return r.json(); }),
                fetch('./data/dialogue.json').then(r => { if (!r.ok) throw new Error('dialogue.json missing'); return r.json(); }),
                fetch('./data/quests.json').then(r => { if (!r.ok) throw new Error('quests.json missing'); return r.json(); })
            ]);

            this.items = items;
            this.npcs = npcs;
            this.dialogue = dialogue;
            this.quests = quests;

            console.log("ModuleManager: All data loaded successfully.");
            return true;
        } catch (error) {
            console.error("CRITICAL ERROR: Failed to load game data.", error);
            throw error;
        }
    }
}
