import React from 'react';
import { WebView } from 'react-native-webview';

export default function Mapview({ route }) {
  // const {
  //   lat1 = 31.4045839,
  //   lng1 = 74.301132,
  //   lat2 = 31.500000,
  //   lng2 = 74.400000
  // } = route?.params || {};
    const {
    lat1,
    lng1,
    lat2,
    lng2
  } = route?.params || {};

  // console.log("param===",lat1,
  //   lng1,
  //   lat2,
  //   lng2);

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="initial-scale=1.0, width=device-width" />
<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
<link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />

<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>

<style>
  body, html { margin:0; padding:0; width:100%; height:100%; }
  #map { height: 100vh; width: 100vw; }

  .eta-box {
    background:white;
    padding:10px 14px;
    border-radius:12px;
    font-size:16px;
    font-weight:bold;
    box-shadow:0 2px 8px rgba(0,0,0,0.15);
    margin-top:12px;
    margin-right:12px;
  }
</style>
</head>

<body>
<div id="map"></div>

<script>
// ------------------------
// INITIALIZE MAP
// ------------------------
var map = L.map('map').setView([${lat1}, ${lng1}], 13);

// Tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map);

// ------------------------
// ICONS
// ------------------------
var customerIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/128/15735/15735364.png',
  iconSize: [50, 50],
  iconAnchor: [25, 50]
});

var providerIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/128/741/741407.png',
  iconSize: [50, 50],
  iconAnchor: [25, 50]
});

// ------------------------
// MARKERS
// ------------------------
var customerMarker = L.marker([${lat1}, ${lng1}], { icon: customerIcon }).addTo(map);
var providerMarker = L.marker([${lat2}, ${lng2}], { icon: providerIcon }).addTo(map);

// ------------------------
// ETA DISPLAY
// ------------------------
var etaControl = L.control({ position: 'topright' });

etaControl.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'eta-box');
  this.update("Calculating...");
  return this._div;
};

etaControl.update = function(text) {
  this._div.innerHTML = "<b>ETA:</b> " + text;
};

etaControl.addTo(map);

// ------------------------
// ROUTING
// ------------------------
var routeControl = L.Routing.control({
  waypoints: [
    L.latLng(${lat2}, ${lng2}),
    L.latLng(${lat1}, ${lng1})
  ],
  addWaypoints: false,
  draggableWaypoints: false,
  routeWhileDragging: false,
  show: false,
  createMarker: () => null,
  lineOptions: { styles: [{ color: '#4CAF50', weight: 7 }] }
}).addTo(map);

// ------------------------
// WHEN ROUTE IS READY → SMOOTH MOVE PROVIDER
// ------------------------
routeControl.on('routesfound', function(e) {
  var route = e.routes[0];
  var coords = route.coordinates;

  var step = 0;
  var fraction = 0;
  var speed = 0.02; // fraction per frame for smooth movement

  function animate() {
    if (step >= coords.length - 1) {
      providerMarker.setLatLng(coords[coords.length - 1]);
      etaControl.update("Arrived!");
      return;
    }

    var start = coords[step];
    var end = coords[step + 1];

    fraction += speed;
    if (fraction > 1) {
      fraction = 0;
      step++;
      requestAnimationFrame(animate);
      return;
    }

    var lat = start.lat + (end.lat - start.lat) * fraction;
    var lng = start.lng + (end.lng - start.lng) * fraction;
    providerMarker.setLatLng([lat, lng]);

    // ETA Calculation
    var remaining = 0;
    for (let i = step + 1; i < coords.length; i++) {
      remaining += map.distance(coords[i - 1], coords[i]);
    }
    remaining += map.distance([lat, lng], coords[step + 1]);
    var remainingKm = remaining / 1000;
    var etaMin = (remainingKm * 0.5).toFixed(1);
    etaControl.update(etaMin + " min");

    requestAnimationFrame(animate);
  }

  animate();
});
</script>

</body>
</html>
`;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  );
}
