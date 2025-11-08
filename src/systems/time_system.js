/**
 * time_system.js
 * PILLAR 5: RADICAL MODULARITY (Event-Driven)
 *
 * Manages the absolute flow of time and notifies the rest of the
 * world when significant temporal milestones occur.
 */

import { System } from '../ecs.js';

// Constants for easier tweaking later (maybe load from external config eventually)
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_WEEK = 7;

export class TimeSystem extends System {
    constructor() {
        super();
        // We don't need any specific components to run, we always run.
        this.requiredComponents = [];

        // Initial State: Day 1, 08:00 AM, Monday (Day 0)
        this.totalTurns = 0;
        this.minute = 0;
        this.hour = 8;
        this.day = 1;
        this.dayOfWeek = 0;
    }

    update(world, entities, turns_passed) {
        if (turns_passed <= 0) return;

        this.totalTurns += turns_passed;
        this.minute += turns_passed;

        // --- TIME ROLLOVER LOGIC ---
        // Using while loops to handle cases where huge amounts of time pass at once
        // (e.g., waiting, sleeping, or fast travel).

        let hourChanged = false;
        let dayChanged = false;

        while (this.minute >= MINUTES_PER_HOUR) {
            this.minute -= MINUTES_PER_HOUR;
            this.hour++;
            hourChanged = true;

            while (this.hour >= HOURS_PER_DAY) {
                this.hour -= HOURS_PER_DAY;
                this.day++;
                this.dayOfWeek = (this.dayOfWeek + 1) % DAYS_PER_WEEK;
                dayChanged = true;
            }
        }

        // --- EVENT DISPATCH ---
        // We attach current time state to the events so listeners don't have to query us.

        if (hourChanged) {
            this.dispatch('OnHourChange', { hour: this.hour, day: this.day });
        }

        if (dayChanged) {
            this.dispatch('OnDayChange', { day: this.day, dayOfWeek: this.dayOfWeek });
            this.dispatch('OnDayOfWeekChange', { dayOfWeek: this.dayOfWeek });
        }
    }

    /**
     * Helper to fire decoupled events that any other system can listen to.
     * @param {string} eventName
     * @param {object} detail - Data to pass to listeners
     */
    dispatch(eventName, detail) {
        const event = new CustomEvent(eventName, { detail: detail });
        window.dispatchEvent(event);
        // console.log(`[TimeSystem] Event Dispatched: ${eventName}`, detail); // Debug
    }

    // Optional: Helper for UI to get a formatted time string
    getTimeString() {
        const h = this.hour.toString().padStart(2, '0');
        const m = this.minute.toString().padStart(2, '0');
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return `Day ${this.day} (${days[this.dayOfWeek]}) ${h}:${m}`;
    }
}
