// init.js - Google Maps inicializálás és betöltés kezelése
window.GoogleMapsLoader = {
    isLoaded: false,
    callbacks: [],

    init(callback) {
        if (window.google && window.google.maps && window.google.maps.StreetViewPanorama) {
            console.log("Google Maps API már betöltve");
            this.isLoaded = true;
            setTimeout(() => callback(), 100);
            return;
        }

        this.callbacks.push(callback);

        if (!this.loading) {
            this.loading = true;
            console.log("Google Maps API betöltése...");
            
            // API betöltése
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA9j8szRdKdl6XH8BGcnsbl5zT-XP_i_5k&libraries=places&callback=GoogleMapsLoader.onApiLoaded`;
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                console.log("API script betöltve");
            };
            
            script.onerror = () => {
                console.error('Google Maps API betöltési hiba!');
                alert('Hiba történt a térkép betöltése közben. Kérlek frissítsd az oldalt.');
                this.loading = false;
            };
            
            document.head.appendChild(script);
        }
    },

    onApiLoaded() {
        console.log('Google Maps API callback meghívva');
        this.isLoaded = true;
        console.log('Google Maps API sikeresen betöltve');
        
        // Kis késleltetés hogy biztosan inicializálódjon
        setTimeout(() => {
            this.callbacks.forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.error('Callback error:', error);
                }
            });
            
            this.callbacks = [];
            this.loading = false;
        }, 300);
    }
};