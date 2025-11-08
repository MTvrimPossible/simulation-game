export class ModuleManager {
    constructor() { this.items = {}; this.npcs = {}; this.dialogue = {}; this.quests = {}; }
    async loadAllData() {
        try {
            const [i, n, d, q] = await Promise.all([
                fetch('./data/items.json').then(r => r.json()),
                fetch('./data/npcs.json').then(r => r.json()),
                fetch('./data/dialogue.json').then(r => r.json()),
                fetch('./data/quests.json').then(r => r.json())
            ]);
            this.items = i; this.npcs = n; this.dialogue = d; this.quests = q; return true;
        } catch (e) { console.error("Data load failed", e); document.getElementById('ui-textbox').innerText = "FATAL: Data load failed."; throw e; }
    }
}
