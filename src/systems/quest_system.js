import { System } from '../ecs.js';

export class QuestSystem extends System {
    constructor(moduleManager) {
        super();
        this.moduleManager = moduleManager;
        this.requiredComponents = ['QuestComponent'];
    }

    update(world, entities, turns_passed) {
        if (turns_passed <= 0) return;

        for (const entityId of entities) {
            const questComp = world.getComponent(entityId, 'QuestComponent');
            for (const [questId, progress] of Object.entries(questComp.activeQuests)) {
                this.checkQuestProgress(world, entityId, questId, progress, questComp);
            }
        }
    }

    checkQuestProgress(world, entityId, questId, progress, questComp) {
        const questData = this.moduleManager.quests[questId];
        if (!questData) return;
        const currentStage = questData.stages[progress.stage];
        if (!currentStage || !currentStage.objectives) return;

        let allComplete = true;
        currentStage.objectives.forEach((obj, index) => {
            if (!progress.objectives[index]) {
                if (this.checkObjective(world, entityId, obj)) {
                    progress.objectives[index] = true;
                    console.log(`[Quest] ${questData.title}: Objective '${obj.text}' complete.`);
                } else {
                    allComplete = false;
                }
            }
        });

        if (allComplete) {
            this.advanceStage(questId, progress, currentStage, questComp);
        }
    }

    checkObjective(world, entityId, objective) {
        if (objective.type === 'HAVE_ITEM') {
            const inv = world.getComponent(entityId, 'InventoryComponent');
            return inv && inv.items.filter(i => i.id === objective.target).length >= objective.count;
        }
        return false;
    }

    advanceStage(questId, progress, currentStage, questComp) {
         const nextStageId = currentStage.next_stage;
         if (nextStageId === 'complete') {
             console.log(`[Quest] COMPLETED: ${questId}`);
             delete questComp.activeQuests[questId];
             questComp.completedQuests.push(questId);
         } else {
             progress.stage = nextStageId;
             progress.objectives = {};
         }
    }
}
