class Bomb {
    constructor(r, c, range, tileSize, board, game) {
        this.r = r;
        this.c = c;
        this.range = range;
        this.tileSize = tileSize;
        this.board = board;
        this.game = game;

        // Calculo de posicion en pixeles para el Canvas
        this.x = c * tileSize;
        this.y = r * tileSize;

        this.timer = 180; // ~3 segundos de mecha (60 FPS)
        this.animFrame = 0;
        this.exploded = false;
    }

    update() {
        this.animFrame++;
        this.timer--;
        if (this.timer <= 0 && !this.exploded) {
            this.explode();
        }
    }

    explode() {
        if (this.exploded) return;
        this.exploded = true;
        if (this.game && typeof this.game.triggerExplosion === 'function') {
            this.game.triggerExplosion(this.r, this.c, this.range);
        }
    }

    draw(ctx) {
        if (this.exploded) return;

        const img = window.assetsManager ? window.assetsManager.get('bomb') : null;

        if (img) {
            ctx.drawImage(img, this.x, this.y, this.tileSize, this.tileSize);
        } else {
            const centerX = this.x + this.tileSize / 2;
            const centerY = this.y + this.tileSize / 2;
            const radius = this.tileSize * 0.35;

            ctx.fillStyle = (Math.floor(this.animFrame / 10) % 2 === 0) ? '#111111' : '#e63946';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}