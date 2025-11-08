/**
 * ecs.js
 * Core Entity-Component-System engine.
 *
 * PILLAR 5: RADICAL MODULARITY
 * - This module manages the central state but knows nothing of specific game data.
 */

// =========================================
// BASE SYSTEM CLASS
// =========================================
export class System {
    constructor() {
        // Define which components this system needs an entity to have.
        // e.g., ['Position', 'Velocity']
        this.requiredComponents = [];
    }

    /**
     * The core update loop for this system.
     * @param {World} world - Reference to the main ECS World.
     * @param {Array<number>} entities - List of entities that possess ALL required components.
     * @param {number} turns_passed - How much time/turns have passed.
     */
    update(world, entities, turns_passed) {
        // Override this in subclasses
        console.warn(`System ${this.constructor.name} has no update() method implemented.`);
    }
}

// =========================================
// CORE WORLD CLASS
// =========================================
export class World {
    constructor() {
        this.nextEntityId = 1;
        this.entities = []; // List of all active entity IDs
        this.components = {}; // Map: ComponentName -> { EntityID -> ComponentData }
        this.systems = []; // Ordered list of active systems
    }

    /**
     * Creates a new entity (just an integer ID).
     * @returns {number} The new entity ID.
     */
    createEntity() {
        const id = this.nextEntityId++;
        this.entities.push(id);
        return id;
    }

    /**
     * Attaches a component to an entity.
     * @param {number} entityId - The target entity.
     * @param {string} componentName - Name of the component (e.g., 'Position').
     * @param {object} data - The POJO data for this component.
     */
    addComponent(entityId, componentName, data) {
        if (!this.components[componentName]) {
            this.components[componentName] = {};
        }
        this.components[componentName][entityId] = data;
    }

    /**
     * Retrieves a specific component for an entity.
     * @param {number} entityId
     * @param {string} componentName
     * @returns {object|undefined} The component data, or undefined if missing.
     */
    getComponent(entityId, componentName) {
        return this.components[componentName] ? this.components[componentName][entityId] : undefined;
    }

    /**
     * Registers a system to run in the game loop.
     * @param {System} system - Instance of a class extending System.
     */
    registerSystem(system) {
        this.systems.push(system);
    }

    /**
     * Main Game Loop: Advances all systems.
     * @param {number} turns_passed
     */
    updateSystems(turns_passed) {
        // Step 1: Iterate over all registered systems
        for (const system of this.systems) {
            const required = system.requiredComponents;

            // Step 2 & 3: Efficiently find entities with ALL required components
            // We filter the master list of entities.
            const relevantEntities = this.entities.filter(entityId => {
                // Check if this entity has every component required by the system
                return required.every(compName => {
                    // Ensure the component pool exists AND the entity has data in it
                    return this.components[compName] && this.components[compName][entityId] !== undefined;
                });
            });

            // Step 4: Call the system's update with the filtered list
            system.update(this, relevantEntities, turns_passed);
        }
    }
}
