export class DialogueSystem {
    constructor(mm) { this.mm = mm; this.ui = document.getElementById('ui-textbox'); this.runner = null; }
    setRunner(r) { this.runner = r; }
    startDialogue(tid, w, p) {
        const t = this.mm.dialogue[tid]; if (!t) return;
        this.active = t; this.w = w; this.p = p; this.show(t.root);
    }
    show(nid) {
        const n = this.active.nodes[nid]; if (!n) { this.active = null; this.ui.innerHTML = '...'; return; }
        let h = `<p><strong>NPC:</strong> ${n.text}</p>`;
        if (n.options.length) {
            h += '<ul>'; n.options.forEach((o, i) => { if (this.check(o.conditions)) h += `<li><a href="#" d-idx="${i}">[${i+1}] ${o.text}</a></li>`; }); h += '</ul>';
        } else { h += '<p><a href="#" id="end">[End]</a></p>'; }
        this.ui.innerHTML = h;
        this.ui.querySelectorAll('a[d-idx]').forEach(l => l.onclick = e => { e.preventDefault(); this.sel(n.options[l.getAttribute('d-idx')]); });
        const el = this.ui.querySelector('#end'); if (el) el.onclick = e => { e.preventDefault(); this.active = null; this.ui.innerHTML = '...'; };
    }
    sel(o) { if (o.effects) this.apply(o.effects); if (o.link) this.show(o.link); else { this.active = null; this.ui.innerHTML = '...'; } }
    check(c) { if (!c) return true; return c.every(cond => { if (cond.startsWith('HasItem:')) { const i = this.w.getComponent(this.p, 'InventoryComponent'); return i && i.items.some(x => x.id === cond.split(':')[1]); } return true; }); }
    apply(e) { e.forEach(eff => { if (eff.startsWith('TriggerMinigame:')) { this.active = null; this.runner.run(eff.split(':')[1]); } }); }
}
