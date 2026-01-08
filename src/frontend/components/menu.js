window.Menu = {
    init() {
        console.log("📋 Menü inicializálása...");
        
        // Körszám választó gombok
        document.querySelectorAll('.round-choice').forEach(btn => {
            btn.addEventListener('click', function () {
                GameState.maxRounds = parseInt(this.dataset.rounds);
                document.getElementById('start-game').disabled = false;

                document.querySelectorAll('.round-choice')
                    .forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        // Helyszín választó gombok
        document.querySelectorAll('.location-choice').forEach(btn => {
            btn.addEventListener('click', function () {
                GameState.locationChoice = this.dataset.location;

                document.querySelectorAll('.location-choice')
                    .forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        // Start gomb - FIX: arrow function vagy bind használata
        document.getElementById('start-game').addEventListener('click', () => {
            console.log("🎮 Start gomb megnyomva");
            Game.start();
        });

        // Exit gomb
        document.getElementById('exit-game').addEventListener('click', () => {
            console.log("👋 Kilépés");
            window.location.reload();
        });

        console.log("✅ Menü inicializálva");
    }
};