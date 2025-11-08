export class System {
    constructor() { this.requiredComponents = []; }
    update(world, entities, turns_passed) {}
}
export class World {
    constructor() {
        this.nextEntityId = 1; this.entities = []; this.components = {}; this.systems = []; this.isPaused = false; this.playerEntityId = null; this.mapData = null;
    }
    createEntity() { const id = this.nextEntityId++; this.entities.push(id); return id; }
    addComponent(id, name, data) { if (!this.components[name]) this.components[name] = {}; this.components[name][id] = data; }
    getComponent(id, name) { return this.components[name] ? this.components[name][id] : undefined; }
    registerSystem(sys) { this.systems.push(sys); }
    updateSystems(turns) {
        for (const sys of this.systems) {
            sys.update(this, this.entities.filter(e => sys.requiredComponents.every(c => this.components[c] && this.components[c][e] !== undefined)), turns);
        }
    }
    serialize() { return JSON.stringify({ nextEntityId: this.nextEntityId, entities: this.entities, components: this.components, playerEntityId: this.playerEntityId, mapData: this.mapData }); }
    deserialize(json) { const d = JSON.parse(json); this.nextEntityId = d.nextEntityId; this.entities = d.entities; this.components = d.components; this.playerEntityId = d.playerEntityId; this.mapData = d.mapData; }
    getCurrentMap() { return this.mapData || [['.']]; }
}
