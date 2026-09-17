class AssetsManager {
    constructor() {
        this.images = {};
        this.loadedCount = 0;
        this.totalImages = 0;

        this.sources = {
            player: 'assets/images/player_spritesheet.png',
            bomb1: 'assets/images/bomba.png',
            bomb2: 'assets/images/bomba2.png',
            bomb3: 'assets/images/bomba3.png',
            enemy4: 'assets/images/enemy4_spritesheet.png',
            
            enemy1_1: 'assets/images/enemy1_1.png',
            enemy1_2: 'assets/images/enemy1_2.png',
            enemy1_3: 'assets/images/enemy1_3.png',
            enemy1_4: 'assets/images/enemy1_4.png',
            enemy1_5: 'assets/images/enemy1_5.png',
            enemy1_6: 'assets/images/enemy1_6.png',

            enemy2_1: 'assets/images/enemy2_1.png',
            enemy2_2: 'assets/images/enemy2_2.png',
            enemy2_3: 'assets/images/enemy2_3.png',
            enemy2_4: 'assets/images/enemy2_4.png',
            enemy2_5: 'assets/images/enemy2_5.png',

            enemy3_1: 'assets/images/enemy3_1.png',
            enemy3_2: 'assets/images/enemy3_2.png',
            enemy3_3: 'assets/images/enemy3_3.png',
            enemy3_4: 'assets/images/enemy3_4.png',
            enemy3_5: 'assets/images/enemy3_5.png',

            
        };
    }

    loadAll(callback) {
        const keys = Object.keys(this.sources);
        this.totalImages = keys.length;

        if (this.totalImages === 0) return callback();

        keys.forEach(key => {
            const img = new Image();
            img.src = this.sources[key];
            img.onload = () => {
                this.images[key] = img;
                this.checkDone(callback);
            };
            img.onerror = () => {
                this.images[key] = null;
                this.checkDone(callback);
            };
        });
    }

    checkDone(callback) {
        this.loadedCount++;
        if (this.loadedCount === this.totalImages) {
            callback();
        }
    }

    get(key) {
        return this.images[key] || null;
    }
}