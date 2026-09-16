class AssetsManager {
    constructor() {
        this.images = {};
        this.loadedCount = 0;
        this.totalImages = 0;

        this.sources = {
            enemy4: 'assets/images/enemy4.png',
            bomb: 'assets/images/bomba.png',
            player: 'assets/images/player.png'
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