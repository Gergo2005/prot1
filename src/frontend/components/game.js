window.Game = {
    currentPanorama: null,
    isLoading: false,
    streetViewService: null,
    roundDelay: 1500,
    
    usedLocations: new Set(),

    start() {
        console.log("🚀 Játék indítása...");
        
        document.getElementById('menu').style.display = 'none';
        document.getElementById('game').style.display = 'block';

        GameState.totalScore = 0;
        GameState.currentRound = 1;
        Game.updateScore();

        this.streetViewService = new google.maps.StreetViewService();
        this.usedLocations.clear();

        this.initRound();
    },

    initRound() {
        console.log(`🔄 KÖR ${GameState.currentRound} KEZDETE`);
        
        if (this.isLoading) {
            console.log("⚠️ Már töltődik, várakozás...");
            return;
        }
        
        this.isLoading = true;
        this.prepareStreetViewContainer();
        this.cleanupPreviousPanorama();

        setTimeout(() => {
            this.findStreetViewLocation();
        }, 500);
    },

    prepareStreetViewContainer() {
        const container = document.getElementById("street-view");
        container.className = "loading";
        container.innerHTML = `
            <div class="loading-text">
                <div>Kör ${GameState.currentRound} betöltése...</div>
                <div id="loading-details">Véletlenszerű Street View keresése</div>
            </div>
        `;
    },

    cleanupPreviousPanorama() {
        if (this.currentPanorama) {
            try {
                google.maps.event.clearInstanceListeners(this.currentPanorama);
                this.currentPanorama.setVisible(false);
                this.currentPanorama = null;
            } catch (e) {
                console.warn("Előző panorama tisztítása:", e);
            }
        }
        
        GameState.panorama = null;
        GameState.targetLocation = null;
        
        // Térkép tisztítása
        if (GameState.map) {
            // Csak a markert töröljük, a térkép marad
            if (GameState.playerMarker) {
                GameState.playerMarker.setMap(null);
                GameState.playerMarker = null;
            }
        }
    },

    updateLoadingMessage(message) {
        const details = document.getElementById("loading-details");
        if (details) {
            details.textContent = message;
        }
        console.log("📡", message);
    },

    findStreetViewLocation() {
        let attempts = 0;
        const maxAttempts = 20;

        const tryRandomLocation = () => {
            attempts++;
            this.updateLoadingMessage(`Street View keresése (${attempts}/${maxAttempts})...`);

            const randomLocation = this.generateRandomLocation();
            const locationKey = `${randomLocation.lat.toFixed(4)},${randomLocation.lng.toFixed(4)}`;
            
            console.log(`📍 Próbálkozás ${attempts}:`, randomLocation);

            if (this.usedLocations.has(locationKey) && attempts < maxAttempts) {
                setTimeout(tryRandomLocation, 200);
                return;
            }

            this.streetViewService.getPanorama({
                location: randomLocation,
                radius: 25000,
                source: google.maps.StreetViewSource.DEFAULT,
                preference: google.maps.StreetViewPreference.NEAREST
            }, (data, status) => {
                if (status === 'OK' && data && data.location && data.location.pano) {
                    console.log("✅ Street View található!", data.location.latLng);
                    this.usedLocations.add(locationKey);
                    
                    setTimeout(() => {
                        this.loadStreetView(data);
                    }, 300);
                } else {
                    console.log(`❌ Nem található Street View (${status})`);
                    
                    if (attempts < maxAttempts) {
                        setTimeout(tryRandomLocation, 400);
                    } else {
                        this.loadFallbackLocation();
                    }
                }
            });
        };

        tryRandomLocation();
    },

    generateRandomLocation() {
        if (GameState.locationChoice === 'budapest') {
            return {
                lat: 47.49 + Math.random() * 0.06,
                lng: 19.03 + Math.random() * 0.09
            };
        } else {
            return {
                lat: 46.9 + Math.random() * 1.3,
                lng: 18.4 + Math.random() * 2.6
            };
        }
    },

    loadFallbackLocation() {
        const fallbackLocations = [
            { lat: 47.4983, lng: 19.0434 },
            { lat: 47.5008, lng: 19.0465 },
            { lat: 46.2530, lng: 20.1480 },
        ];
        
        const fallback = fallbackLocations[Math.floor(Math.random() * fallbackLocations.length)];
        
        this.streetViewService.getPanorama({
            location: fallback,
            radius: 1000
        }, (data, status) => {
            if (status === 'OK') {
                console.log("🔄 Fallback Street View betöltése");
                this.loadStreetView(data);
            } else {
                this.handleNoStreetViewFound();
            }
        });
    },

    loadStreetView(panoramaData) {
        this.updateLoadingMessage("Street View betöltése...");
        
        const container = document.getElementById("street-view");
        
        try {
            container.innerHTML = '<div id="pano-container" style="width:100%;height:100%;"></div>';
            
            setTimeout(() => {
                try {
                    container.className = '';

                    GameState.targetLocation = {
                        lat: panoramaData.location.latLng.lat(),
                        lng: panoramaData.location.latLng.lng()
                    };

                    console.log("🎯 Cél hely:", GameState.targetLocation);

                    const panoramaOptions = {
                        pano: panoramaData.location.pano,
                        pov: {
                            heading: panoramaData.tiles?.centerHeading || Math.random() * 360,
                            pitch: 0
                        },
                        zoom: 1,
                        visible: true,
                        addressControl: false,
                        fullscreenControl: true,
                        motionTrackingControl: false,
                        panControl: true,
                        zoomControl: true,
                        enableCloseButton: false,
                        showRoadLabels: true,
                        clickToGo: true,
                        scrollwheel: true,
                        disableDoubleClickZoom: false,
                        linksControl: false,
                        imageDateControl: false
                    };

                    this.currentPanorama = new google.maps.StreetViewPanorama(
                        document.getElementById('pano-container'),
                        panoramaOptions
                    );

                    GameState.panorama = this.currentPanorama;
                    this.setupPanoramaListeners();

                } catch (error) {
                    console.error("❌ Panoráma hiba:", error);
                    this.handlePanoramaError(error.message);
                }
            }, 100);
            
        } catch (error) {
            console.error("❌ Container hiba:", error);
            this.handlePanoramaError(error.message);
        }
    },

    setupPanoramaListeners() {
        const panorama = this.currentPanorama;
        let panoramaLoaded = false;

        const onPanoramaLoaded = () => {
            if (panoramaLoaded) return;
            
            panoramaLoaded = true;
            this.isLoading = false;
            console.log("✅ Street View SIKERESEN betöltve!");
            
            setTimeout(() => {
                if (typeof MapComponent !== 'undefined') {
                    MapComponent.init();
                }
            }, 500);
        };

        panorama.addListener('status_changed', () => {
            const status = panorama.getStatus();
            console.log("📊 Street View státusz:", status);
            
            if (status === 'OK') {
                onPanoramaLoaded();
            } else if (status === 'UNKNOWN_ERROR') {
                console.log("⚠️ Street View hiba");
            }
        });

        panorama.addListener('pano_changed', () => {
            if (panorama.getPano() && !panoramaLoaded) {
                onPanoramaLoaded();
            }
        });

        setTimeout(() => {
            if (!panoramaLoaded && panorama.getPano()) {
                onPanoramaLoaded();
            }
        }, 2000);

        setTimeout(() => {
            if (!panoramaLoaded) {
                console.log("⏰ Timeout");
                this.handlePanoramaError("Betöltési időtúllépés");
            }
        }, 8000);
    },

    handleNoStreetViewFound() {
        this.isLoading = false;
        console.log("⚠️ Nem található Street View");
        
        const container = document.getElementById("street-view");
        container.innerHTML = `
            <div class="loading-text" style="background: rgba(255,165,0,0.8);">
                <div>Nem található Street View</div>
                <button class="retry-button" onclick="Game.retryRound()">
                    Újrapróbálkozás
                </button>
                <button class="retry-button" onclick="Game.backToMenu()" style="background:#666; margin-left:10px;">
                    Vissza
                </button>
            </div>
        `;
        container.className = 'loading';
    },

    handlePanoramaError(errorMessage) {
        this.isLoading = false;
        console.error("❌ Street View hiba:", errorMessage);
        
        const container = document.getElementById("street-view");
        container.innerHTML = `
            <div class="loading-text" style="background: rgba(200,0,0,0.8);">
                <div>Hiba: ${errorMessage}</div>
                <button class="retry-button" onclick="Game.retryRound()">
                    Újrapróbálkozás
                </button>
            </div>
        `;
        container.className = 'loading';
    },

    retryRound() {
        console.log("🔄 Újrapróbálkozás");
        setTimeout(() => {
            this.initRound();
        }, 1000);
    },

    backToMenu() {
        document.getElementById('menu').style.display = 'block';
        document.getElementById('game').style.display = 'none';
        this.cleanupPreviousPanorama();
    },

    checkGuess() {
        if (!GameState.playerMarker) {
            alert("Helyezz el egy tippet!");
            return;
        }

        // FONTOS: getPosition() helyett a position tulajdonság
        const markerPosition = GameState.playerMarker.getPosition 
            ? GameState.playerMarker.getPosition() 
            : GameState.playerMarker.position;
        
        const distance = Utils.calculateDistance(
            markerPosition,
            GameState.targetLocation
        );

        const score = Math.max(0, Math.round(5000 - distance * 10));
        GameState.totalScore += score;

        document.getElementById("results").style.display = "block";
        document.getElementById("score").textContent =
            `Távolság: ${distance.toFixed(2)} km | Pont: ${score}`;

        this.updateScore();

        if (GameState.currentRound === GameState.maxRounds) {
            document.getElementById("next-round").textContent = "Játék vége";
        }
    },

    nextRound() {
        if (GameState.currentRound >= GameState.maxRounds) {
            alert(`Játék vége! Összpontszám: ${GameState.totalScore}`);
            this.endGame();
            return;
        }

        GameState.currentRound++;
        document.getElementById("results").style.display = "none";

        if (GameState.playerMarker) {
            GameState.playerMarker.setMap(null);
            GameState.playerMarker = null;
        }

        setTimeout(() => {
            this.initRound();
        }, this.roundDelay);
    },

    endGame() {
        document.getElementById('menu').style.display = 'block';
        document.getElementById('game').style.display = 'none';
        
        this.cleanupPreviousPanorama();
        
        if (GameState.map) {
            const mapContainer = document.getElementById('map');
            if (mapContainer) {
                mapContainer.innerHTML = '';
            }
            GameState.map = null;
        }
        
        GameState.mapInitialized = false;
        GameState.reset();
    },

    updateScore() {
        document.getElementById("score-summary").textContent =
            `Pontszám: ${GameState.totalScore} | Kör: ${GameState.currentRound}/${GameState.maxRounds}`;
    }
};