window.MapComponent = {
    init() {
        console.log("🗺️ Térkép inicializálása...");
        
        // Térkép konténer biztosítása
        const mapElement = document.getElementById("map");
        if (!mapElement) {
            console.error("❌ Map element not found!");
            return;
        }
        
        // Térkép létrehozása TÉRKÉPAZONOSÍTÓVAL
        GameState.map = new google.maps.Map(mapElement, {
            mapId: "magyar_geoguessr_map", // FONTOS: térképazonosító
            center: { lat: 47.1625, lng: 19.5033 },
            zoom: 7,
            restriction: {
                latLngBounds: {
                    north: 48.58,
                    south: 45.74,
                    west: 16.11,
                    east: 22.90
                },
                strictBounds: true
            },
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            mapTypeControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
            }
        });

        // Kattintás esemény a marker helyezésére
        GameState.map.addListener("click", (e) => {
            this.placeMarker(e.latLng);
        });

        // Gomb események
        document.getElementById("submit-guess").onclick = () => Game.checkGuess();
        document.getElementById("next-round").onclick = () => Game.nextRound();
        
        console.log("✅ Térkép inicializálva");
    },

    placeMarker(location) {
        // Régi marker törlése
        if (GameState.playerMarker) {
            if (GameState.playerMarker.map) {
                GameState.playerMarker.setMap(null);
            }
            GameState.playerMarker = null;
        }

        // MINDIG a régi Marker API-t használjuk (mert működik)
        GameState.playerMarker = new google.maps.Marker({
            position: location,
            map: GameState.map,
            draggable: true,
            title: "A tipped",
            animation: google.maps.Animation.DROP
        });

        console.log("📍 Marker elhelyezve:", location.toString());
    }
};