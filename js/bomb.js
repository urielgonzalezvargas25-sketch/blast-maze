class Bomb {
    constructor(r, c, range, tileSize, board, game) {
        this.r = r;
        this.c = c;
        this.range = range;
        this.tileSize = tileSize;
        this.board = board;
        this.game = game;
        this.timer = 180; // ~3 segundos de mecha (60 FPS)
        this.exploded = false;
    }

    update() {
        this.timer--;
        if (this.timer <= 0 && !this.exploded) {
            this.explode();
        }
    }

    explode() {
        if (this.exploded) return;
        this.exploded = true;
        this.game.triggerExplosion(this.r, this.c, this.range);
    }

    draw(ctx) {
        const centerX = this.c * this.tileSize + this.tileSize / 2;
        const centerY = this.r * this.tileSize + this.tileSize / 2;

        ctx.fillStyle = (Math.floor(this.timer / 10) % 2 === 0) ? '#ff3333' : '#ff9900';
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.tileSize * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}