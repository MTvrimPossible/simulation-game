/**
 * pong.js v2 (Responsive Input)
 */

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 7;
const WINNING_SCORE = 3;
const OPPONENT_SPEED = 0.08;

export function StartPoetryPong(canvasId, playerInventory, stakePoem) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return Promise.reject(new Error(`[Pong] Canvas not found.`));
    const ctx = canvas.getContext('2d');

    return new Promise((resolve) => {
        const state = {
            running: true,
            promiseResolve: resolve,
            stake: stakePoem,
            player: { x: PADDLE_WIDTH * 2, y: canvas.height / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: 0 },
            opponent: { x: canvas.width - (PADDLE_WIDTH * 3), y: canvas.height / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: 0 },
            ball: { x: canvas.width / 2, y: canvas.height / 2, radius: BALL_RADIUS, dx: 4 * (Math.random() < 0.5 ? 1 : -1), dy: 2 * (Math.random() < 0.5 ? 1 : -1) }
        };

        // --- UPDATED MOUSE HANDLER ---
        const mouseMoveHandler = (e) => {
            const rect = canvas.getBoundingClientRect();
            // Calculate scale factor (internal resolution / displayed resolution)
            const scaleY = canvas.height / rect.height;

            // Apply scale to mouse position
            const relativeY = (e.clientY - rect.top) * scaleY;

            state.player.y = relativeY - (state.player.height / 2);
            // Clamp to screen bounds
            state.player.y = Math.max(0, Math.min(canvas.height - state.player.height, state.player.y));
        };
        // Use 'pointermove' instead of 'mousemove' for better cross-device support (e.g. touch)
        canvas.addEventListener('pointermove', mouseMoveHandler);

        const resetBall = () => {
            state.ball.x = canvas.width / 2;
            state.ball.y = canvas.height / 2;
            state.ball.dx = 4 * (state.ball.dx > 0 ? -1 : 1);
            state.ball.dy = 2 * (Math.random() < 0.5 ? 1 : -1);
        };

        const endGame = (outcome) => {
            state.running = false;
            canvas.removeEventListener('pointermove', mouseMoveHandler); // Clean up listener
            resolve({ outcome: outcome === 'win' ? 'win' : 'loss', prize: outcome === 'win' ? 'opponent_poem' : state.stake.id });
        };

        const update = () => {
            state.ball.x += state.ball.dx;
            state.ball.y += state.ball.dy;
            const targetY = state.ball.y - state.opponent.height / 2;
            state.opponent.y += (targetY - state.opponent.y) * OPPONENT_SPEED;

            if (state.ball.y + state.ball.radius > canvas.height || state.ball.y - state.ball.radius < 0) state.ball.dy = -state.ball.dy;

            if (state.ball.dx < 0 && state.ball.x - state.ball.radius < state.player.x + state.player.width && state.ball.y > state.player.y && state.ball.y < state.player.y + state.player.height) {
                state.ball.dx = -state.ball.dx;
                // Speed up slightly on hit
                state.ball.dx *= 1.05;
                state.ball.dy *= 1.05;
            }
            if (state.ball.dx > 0 && state.ball.x + state.ball.radius > state.opponent.x && state.ball.y > state.opponent.y && state.ball.y < state.opponent.y + state.opponent.height) {
                state.ball.dx = -state.ball.dx;
            }

            if (state.ball.x < 0) { state.opponent.score++; if (state.opponent.score >= WINNING_SCORE) endGame('loss'); else resetBall(); }
            else if (state.ball.x > canvas.width) { state.player.score++; if (state.player.score >= WINNING_SCORE) endGame('win'); else resetBall(); }
        };

        const draw = () => {
            ctx.fillStyle = '#121212'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#e0e0e0'; ctx.font = "32px monospace";
            ctx.fillText(state.player.score, canvas.width * 0.25, 50);
            ctx.fillText(state.opponent.score, canvas.width * 0.75, 50);
            ctx.setLineDash([5, 15]); ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.strokeStyle = '#333'; ctx.stroke();
            ctx.fillStyle = 'white';
            ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
            ctx.fillRect(state.opponent.x, state.opponent.y, state.opponent.width, state.opponent.height);
            ctx.beginPath(); ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2); ctx.fill();
        };

        const gameLoop = () => { if (state.running) { update(); draw(); requestAnimationFrame(gameLoop); } };
        gameLoop();
    });
}
