window.GameState = {
    totalScore: 0,
    currentRound: 1,
    maxRounds: 5,
    locationChoice: 'magyarország',
    targetLocation: null,
    playerMarker: null,
    panorama: null,
    map: null,
    mapInitialized: false,
    
    // Új: Street View sikeres betöltésének követése
    streetViewLoaded: false,
    
    reset() {
        this.totalScore = 0;
        this.currentRound = 1;
        this.targetLocation = null;
        this.playerMarker = null;
        this.mapInitialized = false;
        this.streetViewLoaded = false;
    }
};