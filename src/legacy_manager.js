export class LegacyManager {
    handlePermadeath(w, p) { alert("YOU DIED. Game Over."); localStorage.removeItem('sim_savegame_v1'); location.reload(); }
}
