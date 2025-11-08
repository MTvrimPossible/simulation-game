/**
 * reputation.js
 * PILLAR 3: SYSTEMIC INTERACTIONS (Social Engineering)
 *
 * Manages entity reputation. Inverts standard tropes:
 * Truth reduces reputation, Lies increase it.
 */

import { System } from '../ecs.js';

const REP_GAIN_LIE = 5;
const REP_LOSS_TRUTH = 3;
const MIN_REP = -100;
const MAX_REP = 100;

export class ReputationSystem extends System {
    constructor() {
        super();
        this.requiredComponents = ['ReputationComponent'];
        this.actionQueue = [];

        // Listen for dialogue or social choices
        window.addEventListener('OnSocialAction', this.handleSocialAction.bind(this));
    }

    /**
     * Event handler for 'OnSocialAction'.
     * Expected detail: { entityId: number, actionType: 'LIE'|'TRUTH' }
     */
    handleSocialAction(e) {
        if (e.detail && e.detail.entityId && e.detail.actionType) {
            this.actionQueue.push(e.detail);
        }
    }

    update(world, entities, turns_passed) {
        // Process all pending social actions from the last frame/turn
        while (this.actionQueue.length > 0) {
            const action = this.actionQueue.shift();
            const rep = world.getComponent(action.entityId, 'ReputationComponent');

            // Entity might not have reputation (e.g., standard NPCs might not track it, only Player or key NPCs)
            if (!rep) continue;

            // CORE GDD LOGIC: "Reputation goes up with lies, down with truth"
            if (action.actionType === 'LIE') {
                rep.value += REP_GAIN_LIE;
                // console.log(`[Reputation] Entity ${action.entityId} LIED. Rep increased to ${rep.value}.`);
            } else if (action.actionType === 'TRUTH') {
                rep.value -= REP_LOSS_TRUTH;
                // console.log(`[Reputation] Entity ${action.entityId} told TRUTH. Rep decreased to ${rep.value}.`);
            }

            // Clamp values to keep them sane
            rep.value = Math.max(MIN_REP, Math.min(MAX_REP, rep.value));
        }
    }
}
