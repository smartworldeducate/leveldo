// Mapview.js
import React, { useEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';
import firestore from '@react-native-firebase/firestore';

export default function MapViewScreen({ route }) {
  const {
    lat1,
    lng1,
    providerId,
    offerId,
    requestId,
  } = route?.params || {};

  const webViewRef = useRef(null);
  const lastLocRef = useRef({ lat: lat1 ?? 0, lng: lng1 ?? 0 }); // fallback to customer if provider unknown

  // Firestore listener
  useEffect(() => {
    if (!requestId || !offerId) return;

    const unsub = firestore()
      .collection('serviceRequests')
      .doc(requestId)
      .collection('offers')
      .doc(offerId)
      .onSnapshot(doc => {
        if (!doc.exists) return;
        const loc = doc.data()?.providerLocation;
        if (loc) {
          const [lat, lng] = loc.split(',').map(Number);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            lastLocRef.current = { lat, lng };
            webViewRef.current?.postMessage(
              JSON.stringify({ type: 'UPDATE_PROVIDER', lat, lng })
            );
          }
        } else {
          webViewRef.current?.postMessage(
            JSON.stringify({ type: 'HIDE_PROVIDER' })
          );
        }
      });

    return () => unsub();
  }, [requestId, offerId]);

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="initial-scale=1.0, width=device-width" />
<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
<link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
<script src="https://rawcdn.githack.com/bbecquet/Leaflet.RotatedMarker/master/leaflet.rotatedMarker.js"></script>
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
var providerMarker = null; // initially null, will be added on first Firestore update

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
    L.latLng(${lat1}, ${lng1}), // temporary, provider marker updates via Firebase
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
// SMOOTH MOVE & ROTATION
// ------------------------
function smoothMoveTo(lat, lng) {
  if (!providerMarker) return;
  var start = providerMarker.getLatLng();
  var end = L.latLng(lat, lng);
  var frames = 40;
  var current = 0;

  function animate() {
    current++;
    var t = current / frames;
    if (t > 1) t = 1;
    var newLat = start.lat + (end.lat - start.lat) * t;
    var newLng = start.lng + (end.lng - start.lng) * t;
    var newLatLng = L.latLng(newLat, newLng);
    providerMarker.setLatLng(newLatLng);

    // rotation
    var deltaX = end.lng - start.lng;
    var deltaY = end.lat - start.lat;
    var angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    providerMarker.setRotationAngle(angle);

    if (t < 1) requestAnimationFrame(animate);
  }
  animate();
}

// ------------------------
// SHOW/HIDE PROVIDER
// ------------------------
function showProviderMarkerAt(lat, lng) {
  if (!providerMarker) {
    providerMarker = L.marker([lat, lng], { icon: providerIcon, rotationAngle: 0 }).addTo(map);
  } else {
    providerMarker.setLatLng([lat, lng]);
  }
}

function hideProviderMarker() {
  if (providerMarker && map.hasLayer(providerMarker)) {
    map.removeLayer(providerMarker);
    providerMarker = null;
  }
}

// ------------------------
// RECEIVE FIREBASE LOCATION
// ------------------------
function handleIncomingMessage(event) {
  try {
    var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    if (!data || !data.type) return;

    if (data.type === 'UPDATE_PROVIDER') {
      showProviderMarkerAt(data.lat, data.lng);
      smoothMoveTo(data.lat, data.lng);
    } else if (data.type === 'HIDE_PROVIDER') {
      hideProviderMarker();
    }
  } catch (e) { console.error('handleIncomingMessage', e); }
}

document.addEventListener('message', handleIncomingMessage);
window.addEventListener('message', handleIncomingMessage);
</script>
</body>
</html>
`;

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ html }}
      javaScriptEnabled
      domStorageEnabled
    />
  );
}
