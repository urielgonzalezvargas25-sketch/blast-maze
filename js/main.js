window.addEventListener('load', () => {
    // Si existe el gestor de assets se inicializa de fondo
    if (typeof AssetsManager !== 'undefined') {
        window.assetsManager = new AssetsManager();
        window.assetsManager.loadAll(() => {
            const game = new Game();
            game.init();
        });
    } else {
        const game = new Game();
        game.init();
    }
});