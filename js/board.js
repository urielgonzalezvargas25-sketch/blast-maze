class Board {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.rows = 13;
        this.cols = 15;
        this.tileSize = 40;
        this.exitPos = { r: 0, c: 0 };
        this.animFrame = 0;

        this.generateProceduralBoard();
    }

    generateProceduralBoard() {
        let validBoard = false;

        while (!validBoard) {
            this.grid = [];

            for (let r = 0; r < this.rows; r++) {
                let row = [];
                for (let c = 0; c < this.cols; c++) {
                    if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
                        row.push(1);
                    } else if (r % 2 === 0 && c % 2 === 0) {
                        row.push(1);
                    } else {
                        row.push(Math.random() < 0.7 ? 2 : 0);
                    }
                }
                this.grid.push(row);
            }

            // Zona de seguridad
            this.grid[1][1] = 0;
            this.grid[1][2] = 0;
            this.grid[1][3] = 0;
            this.grid[2][1] = 0;
            this.grid[3][1] = 0;
            this.grid[2][3] = 0;
            this.grid[3][2] = 0;

            let exitPlaced = false;
            while (!exitPlaced) {
                let r = Math.floor(Math.random() * (this.rows - 2)) + 1;
                let c = Math.floor(Math.random() * (this.cols - 2)) + 1;

                if (this.grid[r][c] === 2 && (r > 5 || c > 5)) {
                    this.exitPos = { r, c };
                    exitPlaced = true;
                }
            }

            validBoard = this.hasValidPathBFS(1, 1, this.exitPos.r, this.exitPos.c);
        }
    }

    hasValidPathBFS(startR, startC, targetR, targetC) {
        let queue = [{ r: startR, c: startC }];
        let visited = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));
        visited[startR][startC] = true;

        const directions = [{ r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }];

        while (queue.length > 0) {
            let curr = queue.shift();

            if (curr.r === targetR && curr.c === targetC) return true;

            for (let dir of directions) {
                let nr = curr.r + dir.r;
                let nc = curr.c + dir.c;

                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                    if (!visited[nr][nc] && (this.grid[nr][nc] === 0 || this.grid[nr][nc] === 2)) {
                        visited[nr][nc] = true;
                        queue.push({ r: nr, c: nc });
                    }
                }
            }
        }
        return false;
    }

    draw() {
        this.animFrame++;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const tile = this.grid[r][c];
                const x = c * this.tileSize;
                const y = r * this.tileSize;

                if (tile === 0) {
                    // Suelo con patrón sutil
                    this.ctx.fillStyle = (r + c) % 2 === 0 ? '#181824' : '#14141e';
                    this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                } else if (tile === 1) {
                    // Muro Indestructible con Biselado 3D
                    this.ctx.fillStyle = '#3a3d52';
                    this.ctx.fillRect(x, y, this.tileSize, this.tileSize);

                    this.ctx.fillStyle = '#565a78';
                    this.ctx.fillRect(x, y, this.tileSize, 4);
                    this.ctx.fillRect(x, y, 4, this.tileSize);

                    this.ctx.fillStyle = '#212330';
                    this.ctx.fillRect(x, y + this.tileSize - 4, this.tileSize, 4);
                    this.ctx.fillRect(x + this.tileSize - 4, y, 4, this.tileSize);
                } else if (tile === 2) {
                    // Bloque Destruible (Patrón de Ladrillos)
                    this.ctx.fillStyle = '#a36851';
                    this.ctx.fillRect(x, y, this.tileSize, this.tileSize);

                    this.ctx.strokeStyle = '#6b4131';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);

                    // Líneas de ladrillo internas
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y + 13); this.ctx.lineTo(x + this.tileSize, y + 13);
                    this.ctx.moveTo(x, y + 26); this.ctx.lineTo(x + this.tileSize, y + 26);
                    this.ctx.moveTo(x + 20, y); this.ctx.lineTo(x + 20, y + 13);
                    this.ctx.moveTo(x + 10, y + 13); this.ctx.lineTo(x + 10, y + 26);
                    this.ctx.moveTo(x + 30, y + 26); this.ctx.lineTo(x + 30, y + this.tileSize);
                    this.ctx.stroke();
                } else if (tile === 6) {
                    // Puerta de Salida Animada
                    const pulse = Math.sin(this.animFrame * 0.1) * 3;
                    this.ctx.fillStyle = '#00ff66';
                    this.ctx.fillRect(x + 4 - pulse/2, y + 4 - pulse/2, this.tileSize - 8 + pulse, this.tileSize - 8 + pulse);

                    this.ctx.fillStyle = '#003311';
                    this.ctx.font = 'bold 12px monospace';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('EXIT', x + this.tileSize / 2, y + this.tileSize / 2);
                }

                this.ctx.strokeStyle = '#0a0a10';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);
            }
        }
    }
}