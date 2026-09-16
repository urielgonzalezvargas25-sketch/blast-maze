class PowerUp {
    constructor(r, c, type, tileSize) {
        this.r = r;
        this.c = c;
        this.type = type; // 1: +Alcance, 2: +Bomba, 3: +Velocidad, 4: Escudo
        this.tileSize = tileSize;
        this.collected = false;

        this.colors = {
            1: '#ffcc00', // Amarillo (+Rango)
            2: '#00ccff', // Azul (+Bomba)
            3: '#33ff33', // Verde (+Velocidad)
            4: '#ff00ff'  // Magenta (Escudo)
        };

        this.labels = {
            1: '+F',
            2: '+B',
            3: '+V',
            4: 'S'
        };
    }

    draw(ctx) {
        if (this.collected) return;
        const centerX = this.c * this.tileSize + this.tileSize / 2;
        const centerY = this.r * this.tileSize + this.tileSize / 2;

        ctx.fillStyle = this.colors[this.type];
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.tileSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.labels[this.type], centerX, centerY);
    }
}