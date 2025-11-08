/**
 * pong.js
 * PILLAR 3: MINIGAME (Poetry Pong)
 *
 * A self-contained, mouse-controlled Pong minigame that renders to a <canvas>.
 * It is initiated on-demand and returns a Promise with the game's outcome.
 */

// --- Game Constants ---
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 7;
const WINNING_SCORE = 3;
const OPPONENT_SPEED = 0.08; // Slower, beatable AI

/**
 * Main exported function to start the game.
 * @param {string} canvasId - The ID of the <canvas> element to draw on.
 * @param {object} playerInventory - Reference to the player's inventory (not used by pong, but per spec).
 * @param {object} stakePoem - The item data the player is betting.
 * @returns {Promise<object>} - Resolves with the game result.
 */
export function StartPoetryPong(canvasId, playerInventory, stakePoem) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        return Promise.reject(new Error(`[Pong] Canvas with ID "${canvasId}" not found.`));
    }
    const ctx = canvas.getContext('2d');

    // Return a promise that will be resolved when the game ends.
    return new Promise((resolve) => {
        // --- Game State Initialization ---
        const state = {
            running: true,
            promiseResolve: resolve,
            stake: stakePoem,
            player: {
                x: PADDLE_WIDTH * 2,
                y: canvas.height / 2 - PADDLE_HEIGHT / 2,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT,
                score: 0
            },
            opponent: {
                x: canvas.width - (PADDLE_WIDTH * 3),
                y: canvas.height / 2 - PADDLE_HEIGHT / 2,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT,
                score: 0
            },
            ball: {
                x: canvas.width / 2,
                y: canvas.height / 2,
                radius: BALL_RADIUS,
                dx: 4 * (Math.random() < 0.5 ? 1 : -1), // Random start direction
                dy: 2 * (Math.random() < 0.5 ? 1 : -1)
            }
        };

        // --- Mouse Control ---
        const mouseMoveHandler = (e) => {
            const rect = canvas.getBoundingClientRect();
            state.player.y = e.clientY - rect.top - state.player.height / 2;
            // Clamp paddle to screen
            state.player.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, state.player.y));
        };
        canvas.addEventListener('mousemove', mouseMoveHandler);

        // --- Core Game Functions ---

        const resetBall = () => {
            state.ball.x = canvas.width / 2;
            state.ball.y = canvas.height / 2;
            state.ball.dx = 4 * (state.ball.dx > 0 ? -1 : 1); // Switch serve
            state.ball.dy = 2 * (Math.random() < 0.5 ? 1 : -1);
        };

        const endGame = (outcome) => {
            state.running = false;
            canvas.removeEventListener('mousemove', mouseMoveHandler);

            let result;
            if (outcome === 'win') {
                result = { outcome: 'win', prize: 'opponent_poem' }; // Simplified prize ID
            } else {
                result = { outcome: 'loss', lost: state.stake.id };
            }
            state.promiseResolve(result);
        };

        const update = () => {
            // Move Ball
            state.ball.x += state.ball.dx;
            state.ball.y += state.ball.dy;

            // Opponent AI (simple, follows ball)
            const targetY = state.ball.y - state.opponent.height / 2;
            state.opponent.y += (targetY - state.opponent.y) * OPPONENT_SPEED;

            // Collision: Top/Bottom Walls
            if (state.ball.y + state.ball.radius > canvas.height || state.ball.y - state.ball.radius < 0) {
                state.ball.dy = -state.ball.dy;
            }

            // Collision: Player Paddle
            if (state.ball.dx < 0 &&
                state.ball.x - state.ball.radius < state.player.x + state.player.width &&
                state.ball.y > state.player.y &&
                state.ball.y < state.player.y + state.player.height) {
                state.ball.dx = -state.ball.dx;
            }

            // Collision: Opponent Paddle
            if (state.ball.dx > 0 &&
                state.ball.x + state.ball.radius > state.opponent.x &&
                state.ball.y > state.opponent.y &&
                state.ball.y < state.opponent.y + state.opponent.height) {
                state.ball.dx = -state.ball.dx;
            }

            // Scoring
            if (state.ball.x - state.ball.radius < 0) {
                state.opponent.score++;
                if (state.opponent.score >= WINNING_SCORE) endGame('loss');
                else resetBall();
            } else if (state.ball.x + state.ball.radius > canvas.width) {
                state.player.score++;
                if (state.player.score >= WINNING_SCORE) endGame('win');
                else resetBall();
            }
        };

        const draw = () => {
            // Clear screen
            ctx.fillStyle = '#121212';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#e0e0e0';
            ctx.font = "32px 'Courier New', monospace";

            // Draw Scores
            ctx.fillText(state.player.score, canvas.width * 0.25, 50);
            ctx.fillText(state.opponent.score, canvas.width * 0.75, 50);

            // Draw Center Line
            ctx.setLineDash([5, 10]);
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.strokeStyle = '#e0e0e0';
            ctx.stroke();

            // Draw Paddles
            ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
            ctx.fillRect(state.opponent.x, state.opponent.y, state.opponent.width, state.opponent.height);

            // Draw Ball
            ctx.beginPath();
            ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
            ctx.fill();
        };

        const gameLoop = () => {
            if (!state.running) return;
            update();
            draw();
            requestAnimationFrame(gameLoop);
        };

        // Start the game
        gameLoop();
    });
}
