import { System } from '../ecs.js';

export class NeedsUISystem extends System {
    constructor(world) {
        super();
        this.world = world;
        // Find the UI container once
        this.uiContainer = document.getElementById('ui-textbox');
    }

    update(world, entities, turns_passed) {
        // Only update every few turns to save performance, or on specific events.
        // For now, we'll update every frame for simplicity, but it's inefficient.
        const player = this.world.playerEntityId;
        const needs = this.world.getComponent(player, 'NeedsComponent');

        if (!needs) return;

        // We'll prepend this to whatever text is currently there, or just use a fixed status bar area.
        // Let's use a fixed area at the top of the pre tag actually, it's cleaner.
        // Wait, we can't easily mix text and the map in the same <pre> without flickering.
        // Let's use a new <div> for stats.
    }
}
