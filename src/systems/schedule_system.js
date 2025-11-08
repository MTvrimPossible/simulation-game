import { System } from '../ecs.js';
import { DestinationComponent } from '../components/DestinationComponent.js';

export class ScheduleSystem extends System {
    constructor() {
        super();
        this.requiredComponents = ['ScheduleComponent', 'PositionComponent'];
        
        // Listen for hour changes to trigger schedule updates
        window.addEventListener('OnHourChange', (e) => this.checkSchedules(e.detail));
    }

    checkSchedules(timeData) {
        // timeData = { hour: 8, day: 1 }
        // Format hour as "0800" string for easy lookup
        const timeStr = timeData.hour.toString().padStart(2, '0') + "00";
        console.log(`[ScheduleSystem] Checking schedules for ${timeStr}...`);

        // We need access to 'world' here, which we don't standardly have in event listeners.
        // We'll store the pending time and process it in update() instead to be safe.
        this.pendingTime = timeStr;
    }

    update(world, entities, turns_passed) {
        if (!this.pendingTime) return;

        for (const entityId of entities) {
            const sched = world.getComponent(entityId, 'ScheduleComponent');
            const task = sched.schedule[this.pendingTime];

            if (task) {
                console.log(`[ScheduleSystem] Entity ${entityId} starting task:`, task);
                sched.currentAction = task.action;

                if (task.action === 'moveTo') {
                    // Override any current destination
                    world.addComponent(entityId, 'DestinationComponent', 
                        new DestinationComponent(task.target.x, task.target.y));
                }
            }
        }

        this.pendingTime = null; // Processed
    }
}
