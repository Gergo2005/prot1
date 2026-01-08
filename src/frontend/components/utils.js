window.Utils = {
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    },

    calculateDistance(pos1, pos2) {
        const R = 6371;
        
        // Position kezelés - getPosition() vagy position tulajdonság
        let lat1, lng1, lat2, lng2;
        
        // Első pozíció (marker)
        if (typeof pos1.lat === 'function') {
            lat1 = pos1.lat();
            lng1 = pos1.lng();
        } else if (pos1.lat && pos1.lng) {
            lat1 = pos1.lat;
            lng1 = pos1.lng;
        } else if (pos1.position) {
            lat1 = typeof pos1.position.lat === 'function' ? pos1.position.lat() : pos1.position.lat;
            lng1 = typeof pos1.position.lng === 'function' ? pos1.position.lng() : pos1.position.lng;
        } else {
            console.error("❌ Érvénytelen pos1:", pos1);
            return 9999;
        }
        
        // Második pozíció (cél)
        lat2 = pos2.lat;
        lng2 = pos2.lng;
        
        const dLat = this.deg2rad(lat2 - lat1);
        const dLng = this.deg2rad(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * 
            Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
};