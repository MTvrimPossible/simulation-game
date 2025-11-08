export class GameLoop {
    constructor(world, renderer) {
        this.world = world; this.renderer = renderer; this.running = false;
        this.keyMap = { 'ArrowUp':'MOVE_UP','ArrowDown':'MOVE_DOWN','ArrowLeft':'MOVE_LEFT','ArrowRight':'MOVE_RIGHT' };
        this.lastAction = null;
        window.addEventListener('keydown', e => { if (this.keyMap[e.key]) { this.lastAction = this.keyMap[e.key]; e.preventDefault(); } });
        this.main = this.main.bind(this);
    }
    start() { if (!this.running) { this.running = true; requestAnimationFrame(this.main); } }
    main() {
        if (!this.running) return;
        requestAnimationFrame(this.main);
        if (this.world.isPaused) return;
        if (this.lastAction) { this.world.latestAction = this.lastAction; this.world.updateSystems(1); this.world.latestAction = null; this.lastAction = null; }
        this.renderer.render(this.world.getCurrentMap(), this.world.getRenderableEntities());
    }
}
