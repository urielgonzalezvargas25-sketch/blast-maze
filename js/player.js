class Player {
    constructor(x, y, tileSize, board, game) {
        this.x = x * tileSize;
        this.y = y * tileSize;
        this.tileSize = tileSize;
        this.board = board;
        this.game = game;
        this.speed = 3;
        this.radius = tileSize * 0.38;
        this.color = '#00f0ff';

        this.maxBombs = 1;
        this.bombRange = 2;
        this.hasShield = false;
        this.invulnerableTimer = 0;
        this.facingDir = { x: 0, y: 1 }; // Dirección visual de la mirada

        this.keys = {};
        this.listenEvents();
    }

    resetPosition(r = 1, c = 1) {
        this.x = c * this.tileSize;
        this.y = r * this.tileSize;
    }

    listenEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.keys['Space']) {
                this.placeBomb();
            }
            this.keys[e.key] = true;
            this.keys['Space'] = (e.code === 'Space');
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            if (e.code === 'Space') this.keys['Space'] = false;
        });
    }

    placeBomb() {
        const tileC = Math.floor((this.x + this.tileSize / 2) / this.tileSize);
        const tileR = Math.floor((this.y + this.tileSize / 2) / this.tileSize);

        const activePlayerBombs = this.game.bombs.filter(b => !b.exploded);
        if (activePlayerBombs.length < this.maxBombs) {
            const alreadyHasBomb = activePlayerBombs.some(b => b.r === tileR && b.c === tileC);
            if (!alreadyHasBomb) {
                this.game.bombs.push(new Bomb(tileR, tileC, this.bombRange, this.tileSize, this.board, this.game));
            }
        }
    }

    update() {
        if (this.invulnerableTimer > 0) this.invulnerableTimer--;

        let nextX = this.x;
        let nextY = this.y;
        let movingX = false;
        let movingY = false;

        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) { nextY -= this.speed; movingY = true; this.facingDir = { x: 0, y: -1 }; }
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) { nextY += this.speed; movingY = true; this.facingDir = { x: 0, y: 1 }; }
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) { nextX -= this.speed; movingX = true; this.facingDir = { x: -1, y: 0 }; }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) { nextX += this.speed; movingX = true; this.facingDir = { x: 1, y: 0 }; }

        const snapThreshold = 14;

        if (movingX && !movingY) {
            const centerTileY = Math.floor((this.y + this.tileSize / 2) / this.tileSize) * this.tileSize;
            const diffY = this.y - centerTileY;
            if (Math.abs(diffY) <= snapThreshold) {
                if (diffY > 0) this.y = Math.max(centerTileY, this.y - this.speed);
                else if (diffY < 0) this.y = Math.min(centerTileY, this.y + this.speed);
            }
        }

        if (movingY && !movingX) {
            const centerTileX = Math.floor((this.x + this.tileSize / 2) / this.tileSize) * this.tileSize;
            const diffX = this.x - centerTileX;
            if (Math.abs(diffX) <= snapThreshold) {
                if (diffX > 0) this.x = Math.max(centerTileX, this.x - this.speed);
                else if (diffX < 0) this.x = Math.min(centerTileX, this.x + this.speed);
            }
        }

        if (!this.checkCollision(nextX, this.y)) this.x = nextX;
        if (!this.checkCollision(this.x, nextY)) this.y = nextY;

        this.checkPowerUpCollision();
        this.checkExitCollision();
    }

    checkCollision(newX, newY) {
        const margin = 6;
        const left = newX + margin;
        const right = newX + this.tileSize - margin;
        const top = newY + margin;
        const bottom = newY + this.tileSize - margin;

        const tileLeft = Math.floor(left / this.tileSize);
        const tileRight = Math.floor(right / this.tileSize);
        const tileTop = Math.floor(top / this.tileSize);
        const tileBottom = Math.floor(bottom / this.tileSize);

        for (let r = tileTop; r <= tileBottom; r++) {
            for (let c = tileLeft; c <= tileRight; c++) {
                if (this.board.grid[r] && (this.board.grid[r][c] === 1 || this.board.grid[r][c] === 2)) {
                    return true;
                }
            }
        }
        return false;
    }

    checkPowerUpCollision() {
        const centerR = Math.floor((this.y + this.tileSize / 2) / this.tileSize);
        const centerC = Math.floor((this.x + this.tileSize / 2) / this.tileSize);

        this.game.powerUps.forEach(p => {
            if (!p.collected && p.r === centerR && p.c === centerC) {
                p.collected = true;
                if (p.type === 1) this.bombRange++;
                if (p.type === 2) this.maxBombs++;
                if (p.type === 3) this.speed = Math.min(this.speed + 0.5, 6);
                if (p.type === 4) this.hasShield = true;
                if (p.type === 5) this.game.lives = Math.min(this.game.lives + 1, 5);

                this.game.score += 200;
                this.game.updateHUD();
            }
        });
    }

    checkExitCollision() {
        const centerR = Math.floor((this.y + this.tileSize / 2) / this.tileSize);
        const centerC = Math.floor((this.x + this.tileSize / 2) / this.tileSize);

        if (this.board.grid[centerR] && this.board.grid[centerR][centerC] === 6) {
            this.game.nextLevel();
        }
    }

    draw(ctx) {
        if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 5) % 2 === 0) return;

        const img = window.assetsManager ? window.assetsManager.get('player') : null;

        if (img) {
            // Renderiza la imagen recortada del jugador
            ctx.drawImage(img, this.x, this.y, this.tileSize, this.tileSize);

            // Mantiene el halo visual del escudo en caso de tener el PowerUp activo
            if (this.hasShield) {
                ctx.strokeStyle = '#ff00ff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.x + this.tileSize / 2, this.y + this.tileSize / 2, this.tileSize * 0.45, 0, Math.PI * 2);
                ctx.stroke();
            }
        } else {
            const centerX = this.x + this.tileSize / 2;
            const centerY = this.y + this.tileSize / 2;

            // Sombra proyectada
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + 12, 12, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Cuerpo del Personaje (Gradiente brillante)
            const grad = ctx.createRadialGradient(centerX - 4, centerY - 4, 2, centerX, centerY, this.radius);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, '#00ffff');
            grad.addColorStop(1, '#0088cc');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // Escudo
            if (this.hasShield) {
                ctx.strokeStyle = '#ff00ff';
                ctx.lineWidth = 4;
                ctx.shadowColor = '#ff00ff';
                ctx.shadowBlur = 10;
            } else {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.shadowBlur = 0;
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Ojos orientados según la dirección del movimiento
            const eyeOffsetX = this.facingDir.x * 5;
            const eyeOffsetY = this.facingDir.y * 5;

            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(centerX - 4 + eyeOffsetX, centerY - 2 + eyeOffsetY, 2.5, 0, Math.PI * 2);
            ctx.arc(centerX + 4 + eyeOffsetX, centerY - 2 + eyeOffsetY, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}