/**
 * dialogue_system.js
 * PILLAR 1 & 3: Data-Driven Dialogue with Systemic Condition Checking.
 *
 * Handles parsing dialogue trees, rendering them to the UI, and
 * gating options based on world state (DSM usage, reputation, etc.).
 */

export class DialogueSystem {
    constructor(moduleManager) {
        this.moduleManager = moduleManager;
        this.uiContainer = document.getElementById('ui-textbox');
        this.activeDialogue = null;
        this.currentWorldRef = null;
        this.currentPlayerRef = null;
    }

    /**
     * Initiates a dialogue with an NPC.
     * @param {string} treeId - The ID of the dialogue tree to load (from moduleManager.dialogue).
     * @param {World} world - ECS World reference for condition checking.
     * @param {number} playerEntity - The player entity ID for condition checking.
     */
    startDialogue(treeId, world, playerEntity) {
        const tree = this.moduleManager.dialogue[treeId];
        if (!tree) {
            console.error(`[DialogueSystem] Missing tree: ${treeId}`);
            return;
        }

        this.activeDialogue = tree;
        this.currentWorldRef = world;
        this.currentPlayerRef = playerEntity;

        // Show the root node (usually 'START' or the first defined node)
        const rootNodeId = tree.root || Object.keys(tree.nodes)[0];
        this.showNode(rootNodeId);
    }

    endDialogue() {
        this.uiContainer.innerHTML = '...';
        this.activeDialogue = null;
        this.currentWorldRef = null;
        this.currentPlayerRef = null;
        // Optional: Dispatch event that dialogue ended so other systems can resume
        window.dispatchEvent(new CustomEvent('OnDialogueEnd'));
    }

    showNode(nodeId) {
        if (!this.activeDialogue || !this.activeDialogue.nodes[nodeId]) {
            this.endDialogue();
            return;
        }

        const node = this.activeDialogue.nodes[nodeId];

        // 1. RENDER NPC TEXT
        let html = `<p><strong>NPC:</strong> ${node.text}</p>`;

        // 2. RENDER OPTIONS
        if (node.options && node.options.length > 0) {
            html += '<ul style="list-style: none; padding-left: 0;">';
            node.options.forEach((option, index) => {
                // CORE LOGIC: Condition Parsing
                if (this.checkConditions(option.conditions)) {
                    // Use data-attributes to store which option was clicked
                    html += `<li><a href="#" data-opt-index="${index}" class="dialogue-option">[${index + 1}] ${option.text}</a></li>`;
                }
            });
            html += '</ul>';
        } else {
            // Terminal node
            html += '<p><a href="#" id="end-dialogue-link">[End]</a></p>';
        }

        this.uiContainer.innerHTML = html;

        // 3. ATTACH LISTENERS
        // We must re-attach listeners every time we re-render the HTML.
        this.uiContainer.querySelectorAll('.dialogue-option').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const idx = parseInt(e.target.getAttribute('data-opt-index'));
                this.selectOption(node.options[idx]);
            });
        });

        const endLink = this.uiContainer.querySelector('#end-dialogue-link');
        if (endLink) {
            endLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.endDialogue();
            });
        }
    }

    selectOption(optionData) {
        // Handle effects (e.g., "reputation -5")
        if (optionData.effects) {
            this.applyEffects(optionData.effects);
        }

        // Navigate to next node
        if (optionData.link) {
            this.showNode(optionData.link);
        } else {
            this.endDialogue();
        }
    }

    /**
     * The gatekeeper mechanic.
     * @param {Array<string>} conditions - e.g., ["HasItem:item_004_dsm", "Reputation>50"]
     * @returns {boolean}
     */
    checkConditions(conditions) {
        if (!conditions || conditions.length === 0) return true;

        for (const condStr of conditions) {
            // Simple string parsing. In a real engine, use a proper expression parser.
            if (condStr.startsWith('HasItem:')) {
                const itemId = condStr.split(':')[1];
                // Assume InventoryComponent has a helper, or check manually:
                const inv = this.currentWorldRef.getComponent(this.currentPlayerRef, 'InventoryComponent');
                if (!inv || !inv.items.some(i => i.id === itemId)) {
                    return false; // Condition failed
                }
            }
            // Add other condition types here (Stats, Eras, etc.)
        }

        return true; // All conditions passed
    }

    applyEffects(effects) {
        // STUB: Dispatch events based on effects
        // e.g., if effect is "TriggerSocial:LIE", dispatch 'OnSocialAction' for ReputationSystem
        console.log('[DialogueSystem] Applying effects:', effects);
    }
}
