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

        this.colors = {
            1: '#ff007f', // Magenta (Fantasma Aleatorio)
            2: '#8a2be2', // Morado (Cíclope BFS)
            3: '#00f5d4', // Cían (Robot A*)
            4: '#ff6b35'  // Naranja (Hunter Predictivo)
        };
    }

    update() {
        if (!this.alive) return;

        this.animFrame++;

        // Al estar exactamente alineado con una celda, elige su siguiente destino
        if (this.x === this.targetC * this.tileSize && this.y === this.targetR * this.tileSize) {
            this.r = this.targetR;
            this.c = this.targetC;
            this.chooseNextMove();
        }

        const destX = this.targetC * this.tileSize;
        const destY = this.targetR * this.tileSize;

        if (this.x < destX) this.x = Math.min(this.x + this.speed, destX);
        if (this.x > destX) this.x = Math.max(this.x - this.speed, destX);
        if (this.y < destY) this.y = Math.min(this.y + this.speed, destY);
        if (this.y > destY) this.y = Math.max(this.y - this.speed, destY);
    }

    chooseNextMove() {
        const playerR = Math.floor((this.game.player.y + this.tileSize / 2) / this.tileSize);
        const playerC = Math.floor((this.game.player.x + this.tileSize / 2) / this.tileSize);

        if (this.type === 1) {
            // Enemigo 1: Movimiento Aleatorio
            const neighbors = this.getValidNeighbors(this.r, this.c);
            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.targetR = next.r;
                this.targetC = next.c;
            }
        } else if (this.type === 2) {
            // Enemigo 2: Búsqueda a lo Ancho (BFS)
            this.path = this.findPathBFS(this.r, this.c, playerR, playerC);
            if (this.path.length > 1) {
                this.targetR = this.path[1].r;
                this.targetC = this.path[1].c;
            }
        } else if (this.type === 3) {
            // Enemigo 3: Algoritmo A*
            this.path = this.findPathAStar(this.r, this.c, playerR, playerC);
            if (this.path.length > 1) {
                this.targetR = this.path[1].r;
                this.targetC = this.path[1].c;
            }
        } else if (this.type === 4) {
            // Enemigo 4: Persecución Predictiva
            let predR = playerR;
            let predC = playerC;
            if (this.game.player.keys['ArrowUp'] || this.game.player.keys['w']) predR -= 3;
            if (this.game.player.keys['ArrowDown'] || this.game.player.keys['s']) predR += 3;
            if (this.game.player.keys['ArrowLeft'] || this.game.player.keys['a']) predC -= 3;
            if (this.game.player.keys['ArrowRight'] || this.game.player.keys['d']) predC += 3;

            predR = Math.max(1, Math.min(this.board.rows - 2, predR));
            predC = Math.max(1, Math.min(this.board.cols - 2, predC));

            this.path = this.findPathAStar(this.r, this.c, predR, predC);
            if (this.path.length > 1) {
                this.targetR = this.path[1].r;
                this.targetC = this.path[1].c;
            } else {
                this.path = this.findPathAStar(this.r, this.c, playerR, playerC);
                if (this.path.length > 1) {
                    this.targetR = this.path[1].r;
                    this.targetC = this.path[1].c;
                }
            }
        }
    }

    getValidNeighbors(r, c) {
        const dirs = [{ r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }];
        let valid = [];
        for (let d of dirs) {
            let nr = r + d.r;
            let nc = c + d.c;
            if (this.board.grid[nr] && this.board.grid[nr][nc] === 0) {
                valid.push({ r: nr, c: nc });
            }
        }
        return valid;
    }

    findPathBFS(startR, startC, targetR, targetC) {
        let queue = [[{ r: startR, c: startC }]];
        let visited = Array.from({ length: this.board.rows }, () => Array(this.board.cols).fill(false));
        visited[startR][startC] = true;

        while (queue.length > 0) {
            let path = queue.shift();
            let curr = path[path.length - 1];

            if (curr.r === targetR && curr.c === targetC) return path;

            for (let n of this.getValidNeighbors(curr.r, curr.c)) {
                if (!visited[n.r][n.c]) {
                    visited[n.r][n.c] = true;
                    queue.push([...path, n]);
                }
            }
        }
        return [];
    }

    findPathAStar(startR, startC, targetR, targetC) {
        let openSet = [{ r: startR, c: startC, g: 0, h: 0, f: 0, parent: null }];
        let closedSet = [];

        const heuristic = (r1, c1, r2, c2) => Math.abs(r1 - r2) + Math.abs(c1 - c2);

        while (openSet.length > 0) {
            openSet.sort((a, b) => a.f - b.f);
            let current = openSet.shift();

            if (current.r === targetR && current.c === targetC) {
                let path = [];
                let temp = current;
                while (temp) {
                    path.push({ r: temp.r, c: temp.c });
                    temp = temp.parent;
                }
                return path.reverse();
            }

            closedSet.push(current);

            for (let n of this.getValidNeighbors(current.r, current.c)) {
                if (closedSet.some(c => c.r === n.r && c.c === n.c)) continue;

                let g = current.g + 1;
                let h = heuristic(n.r, n.c, targetR, targetC);
                let f = g + h;

                let openNode = openSet.find(o => o.r === n.r && o.c === n.c);
                if (!openNode) {
                    openSet.push({ r: n.r, c: n.c, g, h, f, parent: current });
                } else if (g < openNode.g) {
                    openNode.g = g;
                    openNode.f = f;
                    openNode.parent = current;
                }
            }
        }
        return [];
    }

    drawDebugPath(ctx) {
        if (!this.alive || !this.path || this.path.length < 2) return;

        ctx.strokeStyle = this.colors[this.type];
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < this.path.length; i++) {
            const px = this.path[i].c * this.tileSize + this.tileSize / 2;
            const py = this.path[i].r * this.tileSize + this.tileSize / 2;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        this.path.forEach(p => {
            ctx.fillStyle = this.colors[this.type];
            ctx.beginPath();
            ctx.arc(p.c * this.tileSize + this.tileSize / 2, p.r * this.tileSize + this.tileSize / 2, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    draw(ctx) {
        if (!this.alive) return;

        // Si la imagen existe la renderiza; si no, utiliza la figura vectorial de respaldo
        const imgKey = `enemy${this.type}`;
        const img = window.assetsManager ? window.assetsManager.get(imgKey) : null;

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

            ctx.fillStyle = '#ffffff';
            if (this.type === 1) { 
                const eyeOffset = (Math.floor(this.animFrame / 15) % 2 === 0) ? 1 : 0;
                ctx.beginPath();
                ctx.arc(centerX - 5, centerY - 3 + eyeOffset, 3, 0, Math.PI * 2);
                ctx.arc(centerX + 5, centerY - 3 + eyeOffset, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 2) { 
                ctx.beginPath();
                ctx.arc(centerX, centerY - 2, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(centerX, centerY - 2, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 3) { 
                ctx.fillRect(centerX - 8, centerY - 4, 16, 4);
            } else if (this.type === 4) { 
                ctx.fillStyle = '#ff6b35';
                ctx.beginPath();
                ctx.moveTo(centerX - 8, centerY - 8);
                ctx.lineTo(centerX - 4, centerY - 14);
                ctx.lineTo(centerX - 2, centerY - 8);
                ctx.moveTo(centerX + 8, centerY - 8);
                ctx.lineTo(centerX + 4, centerY - 14);
                ctx.lineTo(centerX + 2, centerY - 8);
                ctx.fill();

                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(centerX - 4, centerY - 2, 2.5, 0, Math.PI * 2);
                ctx.arc(centerX + 4, centerY - 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.type, centerX, centerY + 10);
        }
    }
}