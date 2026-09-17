class Enemy {
    constructor(r, c, type, tileSize, board, game) {
        this.r = r;
        this.c = c;
        this.x = c * tileSize;
        this.y = r * tileSize;
        this.tileSize = tileSize;
        this.board = board;
        this.game = game;
        this.type = type; 
        this.speed = 1.5;

        this.targetR = r;
        this.targetC = c;
        this.path = [];
        this.alive = true;
        this.animFrame = 0;
        
        // Control de dirección para el Enemigo 4
        this.facingDir = { x: 0, y: 1 }; // Abajo por defecto
        this.isMoving = false;

        this.colors = {
            1: '#ff007f', 
            2: '#8a2be2', 
            3: '#00f5d4', 
            4: '#ff6b35'  
        };
    }

    update() {
        if (!this.alive) return;

        if (this.x === this.targetC * this.tileSize && this.y === this.targetR * this.tileSize) {
            this.r = this.targetR;
            this.c = this.targetC;
            this.chooseNextMove();
        }

        const destX = this.targetC * this.tileSize;
        const destY = this.targetR * this.tileSize;

        this.isMoving = (this.x !== destX || this.y !== destY);

        if (this.isMoving) {
            this.animFrame++;
            // Detectar la dirección exacta hacia la que camina la IA
            if (this.x < destX) this.facingDir = { x: 1, y: 0 };      // Derecha
            else if (this.x > destX) this.facingDir = { x: -1, y: 0 }; // Izquierda
            else if (this.y < destY) this.facingDir = { x: 0, y: 1 };  // Abajo
            else if (this.y > destY) this.facingDir = { x: 0, y: -1 }; // Arriba
        } else {
            this.animFrame = 0;
        }

        if (this.x < destX) this.x = Math.min(this.x + this.speed, destX);
        if (this.x > destX) this.x = Math.max(this.x - this.speed, destX);
        if (this.y < destY) this.y = Math.min(this.y + this.speed, destY);
        if (this.y > destY) this.y = Math.max(this.y - this.speed, destY);
    }

    chooseNextMove() {
        const directions = [
            { r: -1, c: 0 }, { r: 1, c: 0 },
            { r: 0, c: -1 }, { r: 0, c: 1 }
        ];

        const validMoves = directions.filter(d => {
            const nr = this.r + d.r;
            const nc = this.c + d.c;
            return this.board.grid[nr] && this.board.grid[nr][nc] === 0;
        });

        if (validMoves.length > 0) {
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            this.targetR = this.r + move.r;
            this.targetC = this.c + move.c;
        }
    }

    draw(ctx) {
        if (!this.alive) return;

        // Renderizado dinámico por Spritesheet para el Enemigo 4 (6 columnas x 4 filas)
        if (this.type === 4 && window.assetsManager) {
            const img = window.assetsManager.get('enemy4');

            if (img) {
                const totalCols = 6; 
                const totalRows = 4; 

                const frameWidth = img.width / totalCols;
                const frameHeight = img.height / totalRows;

                let row = 0; 
                let col = 0; 

                if (this.isMoving) {
                    if (this.facingDir.x === -1) row = 2;      // Izquierda
                    else if (this.facingDir.x === 1) row = 3;  // Derecha
                    else if (this.facingDir.y === -1) row = 1; // Arriba
                    else if (this.facingDir.y === 1) row = 0;  // Abajo

                    col = Math.floor(this.animFrame / 12) % totalCols;
                } else {
                    col = 0; 
                }

                ctx.drawImage(
                    img,
                    col * frameWidth, row * frameHeight, frameWidth, frameHeight,
                    this.x, this.y, this.tileSize, this.tileSize
                );
                return;
            }
        }

        // Animación por imágenes individuales para Enemigos 1, 2 y 3
        const maxFrames = (this.type === 2 || this.type === 3) ? 5 : 6;
        const frameIndex = (Math.floor(this.animFrame / 16) % maxFrames) + 1;
        
        const imgKey = `enemy${this.type}_${frameIndex}`;
        const fallbackKey = `enemy${this.type}`;
        
        const img = window.assetsManager ? (window.assetsManager.get(imgKey) || window.assetsManager.get(fallbackKey)) : null;

        if (img) {
            ctx.drawImage(img, this.x, this.y, this.tileSize, this.tileSize);
        } else {
            const centerX = this.x + this.tileSize / 2;
            const centerY = this.y + this.tileSize / 2;
            const radius = this.tileSize * 0.35;

            ctx.fillStyle = this.colors[this.type];
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        } 
    }
}