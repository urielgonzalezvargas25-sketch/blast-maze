class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = 600;
        this.canvas.height = 520;

        this.level = 1;
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 180;
        this.frameCount = 0;
        this.debugMode = false;

        this.board = new Board(this.canvas, this.ctx);
        this.player = new Player(1, 1, this.board.tileSize, this.board, this);

        this.bombs = [];
        this.explosions = [];
        this.enemies = [];
        this.powerUps = [];

        this.spawnEnemies();
        this.updateHUD();
        this.listenDebugKey();
    }

    listenDebugKey() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'd' || e.key === 'D') {
                this.debugMode = !this.debugMode;
            }
        });
    }

    spawnEnemies() {
        this.enemies = [];
        const freeTiles = [];
        for (let r = 1; r < this.board.rows - 1; r++) {
            for (let c = 1; c < this.board.cols - 1; c++) {
                if (this.board.grid[r][c] === 0 && !(r <= 2 && c <= 2)) {
                    freeTiles.push({ r, c });
                }
            }
        }

        const enemyCount = Math.min(4 + (this.level - 1), 8);
        for (let i = 0; i < enemyCount; i++) {
            if (freeTiles.length > 0) {
                const index = Math.floor(Math.random() * freeTiles.length);
                const pos = freeTiles.splice(index, 1)[0];
                const type = (i % 4) + 1;
                this.enemies.push(new Enemy(pos.r, pos.c, type, this.board.tileSize, this.board, this));
            }
        }
    }

    nextLevel() {
        this.level++;
        this.score += 1000;
        this.timeLeft = Math.max(120, 180 - (this.level * 10));
        this.board.generateProceduralBoard();
        this.player.resetPosition(1, 1);
        this.bombs = [];
        this.explosions = [];
        this.powerUps = [];
        this.spawnEnemies();
        this.updateHUD();
    }

   loseLife() {
        // Si el jugador está en periodo de gracia / inmunidad, ignora el daño
        if (this.player.invulnerableTimer > 0) return;

        if (this.player.hasShield) {
            this.player.hasShield = false;
            this.player.invulnerableTimer = 90; // 1.5 segundos de inmunidad tras perder el escudo
            return;
        }

        this.lives--;
        this.updateHUD();

        if (this.lives <= 0) {
            alert(`¡Game Over! Puntaje final: ${this.score}`);
            this.resetGame();
        } else {
            this.player.resetPosition(1, 1);
            this.player.invulnerableTimer = 120; // 2 segundos de inmunidad al reaparecer
        }
    }

    resetGame() {
        this.level = 1;
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 180;
        this.board.generateProceduralBoard();
        this.player = new Player(1, 1, this.board.tileSize, this.board, this);
        this.bombs = [];
        this.explosions = [];
        this.powerUps = [];
        this.spawnEnemies();
        this.updateHUD();
    }

    init() {
        this.loop();
    }

    loop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.loop());
    }

    triggerExplosion(startR, startC, range) {
        const directions = [
            { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
        ];

        this.addExplosionTile(startR, startC);

        for (let d of directions) {
            for (let step = 1; step <= range; step++) {
                let nr = startR + (d.r * step);
                let nc = startC + (d.c * step);

                if (nr < 0 || nr >= this.board.rows || nc < 0 || nc >= this.board.cols) break;

                const tile = this.board.grid[nr][nc];

                if (tile === 1) break;

                const hitBomb = this.bombs.find(b => !b.exploded && b.r === nr && b.c === nc);
                if (hitBomb) {
                    this.addExplosionTile(nr, nc);
                    hitBomb.explode();
                    break;
                }

                if (tile === 2) {
                    if (this.board.exitPos.r === nr && this.board.exitPos.c === nc) {
                        this.board.grid[nr][nc] = 6;
                    } else if (Math.random() < 0.35) {
                        const pType = Math.floor(Math.random() * 4) + 1;
                        this.powerUps.push(new PowerUp(nr, nc, pType, this.board.tileSize));
                        this.board.grid[nr][nc] = 0;
                    } else {
                        this.board.grid[nr][nc] = 0;
                    }
                    this.score += 50;
                    this.updateHUD();
                    this.addExplosionTile(nr, nc);
                    break;
                }

                if (tile === 0 || tile === 6) {
                    this.addExplosionTile(nr, nc);
                }
            }
        }
    }

    addExplosionTile(r, c) {
        this.explosions.push({ r, c, timer: 20 });
    }

    updateHUD() {
        document.getElementById('hud-level').innerText = this.level;
        document.getElementById('hud-score').innerText = this.score;
        document.getElementById('hud-lives').innerText = this.lives;
        document.getElementById('hud-time').innerText = this.timeLeft;
    }

    update() {
        this.frameCount++;
        if (this.frameCount >= 60) {
            this.frameCount = 0;
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateHUD();
            } else {
                this.loseLife();
                this.timeLeft = 180;
            }
        }

        this.player.update();
        this.bombs.forEach(bomb => bomb.update());
        this.bombs = this.bombs.filter(bomb => !bomb.exploded);

        this.explosions.forEach(exp => exp.timer--);
        this.explosions = this.explosions.filter(exp => exp.timer > 0);

        const playerR = Math.floor((this.player.y + this.board.tileSize / 2) / this.board.tileSize);
        const playerC = Math.floor((this.player.x + this.board.tileSize / 2) / this.board.tileSize);
        if (this.explosions.some(e => e.r === playerR && e.c === playerC)) {
            this.loseLife();
        }

        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                enemy.update();

                this.explosions.forEach(exp => {
                    if (enemy.r === exp.r && enemy.c === exp.c) {
                        enemy.alive = false;
                        this.score += 300;
                        this.updateHUD();
                    }
                });

                if (enemy.r === playerR && enemy.c === playerC) {
                    this.loseLife();
                }
            }
        });
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.board.draw();

        this.powerUps.forEach(p => p.draw(this.ctx));
        this.bombs.forEach(bomb => bomb.draw(this.ctx));

        this.explosions.forEach(exp => {
            this.ctx.fillStyle = '#ff4500';
            this.ctx.fillRect(
                exp.c * this.board.tileSize,
                exp.r * this.board.tileSize,
                this.board.tileSize,
                this.board.tileSize
            );
        });

        // Dibujar rutas de depuración antes de los personajes
        if (this.debugMode) {
            this.enemies.forEach(e => e.drawDebugPath(this.ctx));
        }

        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.player.draw(this.ctx);

        // Capa de depuración superior (Hitboxes y Coordenadas)
        if (this.debugMode) {
            this.drawDebugOverlay();
        }
    }

    drawDebugOverlay() {
        const ts = this.board.tileSize;

        // 1. Renderizar hitboxes del jugador
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(this.player.x + 6, this.player.y + 6, ts - 12, ts - 12);

        // 2. Renderizar hitboxes y coordenadas de los enemigos
        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                this.ctx.strokeStyle = '#ff0000';
                this.ctx.strokeRect(enemy.x + 4, enemy.y + 4, ts - 8, ts - 8);

                this.ctx.fillStyle = '#ffff00';
                this.ctx.font = '10px monospace';
                this.ctx.fillText(`(${enemy.r},${enemy.c})`, enemy.x + ts / 2, enemy.y - 4);
            }
        });

        // 3. Renderizar texto de datos del Jugador en la esquina superior izquierda
        const playerR = Math.floor((this.player.y + ts / 2) / ts);
        const playerC = Math.floor((this.player.x + ts / 2) / ts);

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(5, 5, 220, 45);
        this.ctx.strokeStyle = '#00ffcc';
        this.ctx.strokeRect(5, 5, 220, 45);

        this.ctx.fillStyle = '#00ffcc';
        this.ctx.font = 'bold 11px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`DEBUG MODE: ACTIVE (Tecla D)`, 10, 20);
        this.ctx.fillText(`Player Pos: Matriz[${playerR},${playerC}]`, 10, 33);
        this.ctx.fillText(`Px: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`, 10, 44);
    }
}