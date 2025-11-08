import { System } from '../ecs.js';

export class NeedsUISystem extends System {
    constructor(world) {
        super();
        this.world = world;
        this.statsBar = document.getElementById('stats-bar');
    }

    update(world, entities, turns_passed) {
        const player = world.playerEntityId;
        // Guard clause in case player is already dead/removed
        if (!player) return;

        const needs = world.getComponent(player, 'NeedsComponent');
        const mp = world.getComponent(player, 'MicroplasticsComponent');

        if (needs && this.statsBar) {
            this.statsBar.innerText =
                `HNG: ${needs.Ea.toFixed(0)}% | THI: ${needs.Dr.toFixed(0)}% | SLP: ${needs.Sl.toFixed(0)}% | MP: ${mp ? mp.amount : 0}`;
        }
    }
}
