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

    // --- NEW: SERIALIZATION ---
    serialize() {
        return JSON.stringify({
            nextEntityId: this.nextEntityId,
            entities: this.entities,
            components: this.components,
            playerEntityId: this.playerEntityId
            // Note: We do NOT save 'systems', they must be re-registered on load.
        });
    }

    deserialize(jsonString) {
        const data = JSON.parse(jsonString);
        this.nextEntityId = data.nextEntityId;
        this.entities = data.entities;
        this.components = data.components;
        this.playerEntityId = data.playerEntityId;

        // IMPORTANT: Re-assign prototype methods if components were classes with methods.
        // For now, our components are mostly data, BUT some like NeedsComponent have methods.
        // We need a 'hydration' step here if we want those methods back.
        // A simple way is just to ensure Systems don't rely on Component methods, only data.
        // (We broke this rule with NeedsComponent.updateDecay earlier. We might need to fix that later.)
    }
}
