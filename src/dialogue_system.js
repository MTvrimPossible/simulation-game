/**
 * dialogue_system.js v2 (Supports Minigame Triggers)
 */
export class DialogueSystem {
    constructor(moduleManager) {
        this.moduleManager = moduleManager;
        this.uiContainer = document.getElementById('ui-textbox');
        this.activeDialogue = null;
        this.minigameRunner = null; // Will be injected later
    }

    // NEW: Allow injecting the runner after instantiation
    setRunner(runner) {
        this.minigameRunner = runner;
    }

    startDialogue(treeId, world, playerEntity) {
        const tree = this.moduleManager.dialogue[treeId];
        if (!tree) return;
        this.activeDialogue = tree;
        this.currentWorldRef = world;
        this.currentPlayerRef = playerEntity;
        this.showNode(tree.root || Object.keys(tree.nodes)[0]);
    }

    endDialogue() {
        this.uiContainer.innerHTML = '...';
        this.activeDialogue = null;
    }

    showNode(nodeId) {
        if (!this.activeDialogue || !this.activeDialogue.nodes[nodeId]) {
            this.endDialogue(); return;
        }
        const node = this.activeDialogue.nodes[nodeId];
        let html = `<p><strong>NPC:</strong> ${node.text}</p>`;
        if (node.options && node.options.length > 0) {
            html += '<ul style="list-style: none; padding-left: 0;">';
            node.options.forEach((option, index) => {
                if (this.checkConditions(option.conditions)) {
                    html += `<li><a href="#" data-opt-index="${index}" class="dialogue-option">[${index + 1}] ${option.text}</a></li>`;
                }
            });
            html += '</ul>';
        } else {
            html += '<p><a href="#" id="end-dialogue-link">[End]</a></p>';
        }
        this.uiContainer.innerHTML = html;
        this.uiContainer.querySelectorAll('.dialogue-option').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectOption(node.options[parseInt(e.target.getAttribute('data-opt-index'))]);
            });
        });
        const endLink = this.uiContainer.querySelector('#end-dialogue-link');
        if (endLink) endLink.addEventListener('click', (e) => { e.preventDefault(); this.endDialogue(); });
    }

    selectOption(optionData) {
        if (optionData.effects) this.applyEffects(optionData.effects);
        if (optionData.link) this.showNode(optionData.link);
        else this.endDialogue();
    }

    checkConditions(conditions) {
        if (!conditions) return true;
        for (const c of conditions) {
            if (c.startsWith('HasItem:')) {
                const inv = this.currentWorldRef.getComponent(this.currentPlayerRef, 'InventoryComponent');
                if (!inv || !inv.items.some(i => i.id === c.split(':')[1])) return false;
            }
        }
        return true;
    }

    applyEffects(effects) {
        effects.forEach(eff => {
            // NEW: Minigame Trigger
            if (eff.startsWith('TriggerMinigame:')) {
                const gameId = eff.split(':')[1];
                if (this.minigameRunner) {
                    this.endDialogue(); // End dialogue before game starts
                    this.minigameRunner.run(gameId);
                }
            }
            // ... other effects ...
        });
    }
}
