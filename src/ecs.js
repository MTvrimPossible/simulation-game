/**
 * ecs.js v2 (With Serialization)
 */

export class System {
    constructor() { this.requiredComponents = []; }
    update(world, entities, turns_passed) { console.warn(`System ${this.constructor.name} has no update() method.`); }
}

export class World {
    constructor() {
        this.nextEntityId = 1;
        this.entities = [];
        this.components = {};
        this.systems = [];
        this.isPaused = false;
        this.playerEntityId = null; // Important to save!
    }

    createEntity() {
        const id = this.nextEntityId++;
        this.entities.push(id);
        return id;
    }

    addComponent(entityId, componentName, data) {
        if (!this.components[componentName]) this.components[componentName] = {};
        this.components[componentName][entityId] = data;
    }

    getComponent(entityId, componentName) {
        return this.components[componentName] ? this.components[componentName][entityId] : undefined;
    }

    registerSystem(system) { this.systems.push(system); }

    updateSystems(turns_passed) {
        for (const system of this.systems) {
            const required = system.requiredComponents;
            const relevantEntities = this.entities.filter(entityId => {
                return required.every(compName => {
                    return this.components[compName] && this.components[compName][entityId] !== undefined;
                });
            });
            system.update(this, relevantEntities, turns_passed);
        }
    }

// In src/ecs.js Class World:

    // Update serialize:
    serialize() {
        return JSON.stringify({
            nextEntityId: this.nextEntityId,
            entities: this.entities,
            components: this.components,
            playerEntityId: this.playerEntityId,
            mapData: this.mapData // <--- ADD THIS
        });
    }

    // Update deserialize:
    deserialize(jsonString) {
        const data = JSON.parse(jsonString);
        this.nextEntityId = data.nextEntityId;
        this.entities = data.entities;
        this.components = data.components;
        this.playerEntityId = data.playerEntityId;
        this.mapData = data.mapData; // <--- AND THIS
    }

    // AND ADD THIS HELPER SO GAMELOOP FINDS IT AFTER LOAD:
    getCurrentMap() {
        return this.mapData || [['.']];
    }
