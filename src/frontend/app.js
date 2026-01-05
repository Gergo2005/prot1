let map;
let panorama;
let targetLocation;
let playerMarker;

let totalScore = 0;
let currentRound = 0;
let maxRounds = 0;

let locationChoice = 'magyarország';

function initMenu() {
    document.querySelectorAll('.round-choice').forEach(btn => {
        btn.addEventListener('click', function () {
            maxRounds = parseInt(this.dataset.rounds);
            document.getElementById('start-game').disabled = false;

            document.querySelectorAll('.round-choice')
                .forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    document.querySelectorAll('.location-choice').forEach(btn => {
        btn.addEventListener('click', function () {
            locationChoice = this.dataset.location;

            document.querySelectorAll('.location-choice')
                .forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    document.getElementById('start-game').onclick = startGame;
    document.getElementById('exit-game').onclick = () => window.close();
}

function startGame() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game').style.display = 'block';

    totalScore = 0;
    currentRound = 1;
    updateScore();

    initGame();
}

function initGame() {
    const svService = new google.maps.StreetViewService();
    let attempts = 0;

    function tryStreetView() {
        attempts++;
        const randomLoc = getRandomLocation();

        svService.getPanorama({ location: randomLoc, radius: 2000 }, (data, status) => {
            if (status === 'OK') {
                targetLocation = data.location.latLng.toJSON();

                panorama = new google.maps.StreetViewPanorama(
                    document.getElementById("street-view"),
                    {
                        position: targetLocation,
                        pov: { heading: 0, pitch: 0 },
                        zoom: 1,
                        disableDefaultUI: true
                    }
                );

                panorama.addListener('status_changed', () => {
                    if (panorama.getStatus() !== 'OK') {
                        if (attempts < 10) tryStreetView();
                        else alert("Nem található Street View, frissíts!");
                    }
                });

                initMap();
            } else if (attempts < 10) {
                tryStreetView();
            } else {
                alert("Nem található Street View, frissíts!");
            }
        });
    }

    tryStreetView();
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 47.1625, lng: 19.5033 },
        zoom: 6,
        restriction: {
            latLngBounds: {
                north: 48.58,
                south: 45.74,
                west: 16.11,
                east: 22.90
            },
            strictBounds: true
        }
    });

    map.addListener("click", e => placeMarker(e.latLng));

    document.getElementById("submit-guess").onclick = checkGuess;
    document.getElementById("next-round").onclick = nextRound;
}

function getRandomLocation() {
    if (locationChoice === 'budapest') {
        return {
            lat: Math.random() * (47.57 - 47.42) + 47.42,
            lng: Math.random() * (19.15 - 18.96) + 18.96
        };
    }

    return {
        lat: Math.random() * (48.58 - 45.74) + 45.74,
        lng: Math.random() * (22.90 - 16.11) + 16.11
    };
}

function placeMarker(location) {
    if (playerMarker) playerMarker.setMap(null);

    playerMarker = new google.maps.Marker({
        position: location,
        map: map
    });
}

function checkGuess() {
    if (!playerMarker) {
        alert("Helyezz el egy tippet!");
        return;
    }

    const distance = calculateDistance(
        playerMarker.getPosition(),
        targetLocation
    );

    const score = Math.max(0, Math.round(5000 - distance * 10));
    totalScore += score;

    document.getElementById("results").style.display = "block";
    document.getElementById("score").textContent =
        `Távolság: ${distance.toFixed(2)} km | Pont: ${score}`;

    updateScore();

    if (currentRound === maxRounds) {
        document.getElementById("next-round").textContent = "Játék vége";
    }
}

function nextRound() {
    if (currentRound >= maxRounds) {
        alert(`Játék vége! Összpontszám: ${totalScore}`);
        return;
    }

    currentRound++;
    document.getElementById("results").style.display = "none";

    playerMarker?.setMap(null);
    playerMarker = null;

    initGame();
}

function updateScore() {
    document.getElementById("score-summary").textContent =
        `Pontszám: ${totalScore}`;
}

function calculateDistance(pos1, pos2) {
    const R = 6371;
    const dLat = deg2rad(pos2.lat - pos1.lat());
    const dLng = deg2rad(pos2.lng - pos1.lng());

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(deg2rad(pos1.lat())) *
        Math.cos(deg2rad(pos2.lat)) *
        Math.sin(dLng / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

initMenu();
