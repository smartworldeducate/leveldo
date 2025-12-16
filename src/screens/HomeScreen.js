// HomeScreen.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
  RefreshControl,
  Animated,
   PermissionsAndroid,
  Platform,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Menu, MapPin, ListFilter } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
import OfferItem from '../components/OfferItem';
import ProviderRequestCard from '../components/ProviderRequestCard';
import ProviderOwnOfferCard from '../components/ProviderOwnOfferCard';
import CustomerRequestCard from '../components/CustomerRequestCard';
import { WebView } from 'react-native-webview';
// ---------------------------
// Sound setup
// ---------------------------
// Try to load a local bundled sound. If you store notify.mp3 in JS assets, change the require path.
// For Android it's recommended to put the mp3 in android/app/src/main/res/raw/notify.mp3
// or use a remote URL.
// https://written-blue-g5gdbkvtrt-zut8kou571.edgeone.dev/new-notification-09-352705.mp3
const REMOTE_SOUND_URL = 'https://audio-previews.elements.envatousercontent.com/files/472198703/preview.mp3';

Sound.setCategory('Playback');

const playNotification = async () => {
  try {
    // Try local require — change path if you put file elsewhere in project
    // If you use android raw resource, use new Sound('notify.mp3', Sound.MAIN_BUNDLE, ...)
    let sound = null;

    // Attempt common local require (if you put file under ./assets/sounds/notify.mp3)
    try {
      sound = new Sound(require('../assets/sounds/new-notification-09-352705.mp3'), (e) => {
        if (e) {
          // fallback to remote after local fail
          sound = null;
          playRemote();
          return;
        }
        sound.play(() => {
          sound.release();
        });
      });
    } catch (errLocal) {
      // local require failed — fallback to main bundle (Android raw) or remote
      try {
        // Android raw example
        sound = new Sound('notify.mp3', Sound.MAIN_BUNDLE, (e) => {
          if (e) {
            sound = null;
            playRemote();
            return;
          }
          sound.play(() => {
            sound.release();
          });
        });
      } catch (err2) {
        // fallback to remote
        playRemote();
      }
    }

    function playRemote() {
      const remoteSound = new Sound(REMOTE_SOUND_URL, null, (errRemote) => {
        if (errRemote) {
          console.log('Remote sound load failed:', errRemote);
          return;
        }
        remoteSound.play(() => remoteSound.release());
      });
    }
  } catch (err) {
    console.log('playNotification error:', err);
  }
};

// ---------------------------
// Utils
// ---------------------------
const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ---------------------------
// HomeScreen
// ---------------------------
const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [userType, setUserType] = useState('customer');
  const [Offer, setCurrentOffer] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
const [mapCoords, setMapCoords] = useState({
  customerLat: null,
  customerLng: null,
  providerLat: null,
  providerLng: null,
});


const mapRef = useRef(null);

    const watchIdRef = useRef(null);

  // For deduping notifications
  const knownRequestIds = useRef(new Set());
  const knownOfferIds = useRef(new Set());
  const knownAcceptedOfferIds = useRef(new Set());

  // For pulse animation
  const pulse = useRef(new Animated.Value(0)).current;

  // greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';



    const requestLocationPermission = async () => {
      if (Platform.OS !== 'android') return true;
  
      try {
        const fine = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
  
        const coarse = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        );
  
        return (
          fine === PermissionsAndroid.RESULTS.GRANTED &&
          coarse === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.log("Permission error:", err);
        return false;
      }
    };

      const startGPS = async (offer) => {
    const allowed = await requestLocationPermission();
    if (!allowed) {
      Alert.alert("Permission needed", "Please enable location permission.");
      return;
    }

    console.log("🟢 Starting GPS Watch for offer:", offer);

    // console.log("requests===",requests[0]?.location);

    watchIdRef.current = Geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("📍 New Provider Location:", latitude, longitude);

        try {
          await firestore()
            .collection("serviceRequests")
            .doc(offer.requestId)
            .collection("offers")
            .doc(offer.offerId)
            .update({
              providerLocation: `${latitude},${longitude}`,
              updatedAt: new Date().toISOString(),
            });
            // if (showMapModal && mapRef.current) {
            //   mapRef.current.injectJavaScript(`window.updateProviderMarker(${latitude}, ${longitude}); true;`);
            // }

            const customerLocation = requests[0]?.location;
              const [lat1, lng1] = customerLocation.split(',').map(Number);
              //  navigation.navigate("MapViewScreen", {
              //   lat1,
              //   lng1,
              //   lat2 :latitude, 
              //   lng2 : longitude,
              //   providerId: offer.providerId,
              //   offerId:offer.offerId,
              //   requestId: offer.requestId,
              // });
              setCurrentOffer(offer.offerId);
          console.log("🔥 Location updated in Firestore");
        } catch (err) {
          console.log("❌ Error updating Firestore:", err);
        }
      },
      (err) => console.log("❌ GPS Error:", err),
      {
        enableHighAccuracy: true,
        distanceFilter: 1,
        interval: 3000,
        fastestInterval: 1500,
      }
    );
  };


//  useEffect(() => {
//   return () => {
//     // Stop the GPS watcher
//     if (watchIdRef.current) {
//       Geolocation.clearWatch(watchIdRef.current);
//     }
//     // Stop any Firestore listener
//     if (unsub) unsub();
//   };
// }, []);


// useEffect(() => {
//   return () => {
//     // Stop the GPS watcher
//     if (watchIdRef.current) {
//       Geolocation.clearWatch(watchIdRef.current);
//     }

//     // Stop the serviceRequests listener
//     if (unsubRequests) unsubRequests();

//     // Stop all offer listeners
//     if (unsubOffersByRequestRef.current) {
//       Object.values(unsubOffersByRequestRef.current).forEach(fn => {
//         try { fn(); } catch (e) { }
//       });
//     }
//   };
// }, []);



useEffect(() => {
    let unsub = null;

    const init = async () => {
      unsub = console.log("remove previous gp");
    };

    init();

    return () => {
      if (watchIdRef.current) {
        Geolocation.clearWatch(watchIdRef.current);
      }
      if (unsub) unsub();
    };
  }, []);


  // -------------------------
  // animation
  // -------------------------
  // useEffect(() => {
  //   Animated.loop(
  //     Animated.sequence([
  //       Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
  //       Animated.timing(pulse, { toValue: 0, duration: 1600, useNativeDriver: true }),
  //     ])
  //   ).start();
  // }, [pulse]);

  // -------------------------
  // load requests (one-time/bulk)
  // -------------------------
  const loadRequests = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const u = await AsyncStorage.getItem('user');
      if (!u) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(u);
      setCurrentUser(user);
      const type = (user.role || 'customer').toLowerCase();
      setUserType(type);

      const reqSnap = await firestore().collection('serviceRequests').get();
      if (reqSnap.empty) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const requestsArray = reqSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const temp = [];

      for (let req of requestsArray) {
        const offersSnap = await firestore()
          .collection('serviceRequests')
          .doc(req.id)
          .collection('offers')
          .orderBy('sentAt', 'desc')
          .get();

        const offers = offersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // CUSTOMER
        if (type === 'customer') {
          if (req.customerId !== user.uid) continue;
          const visibleOffers = offers.filter(o => o.status !== 'rejected');
          temp.push({ ...req, offers: visibleOffers });
        }

        // PROVIDER
        if (type === 'provider') {
          let withinDistance = true;
          if (req.location) {
            const providerOffersWithLocation = offers.filter(o => o.providerLocation);
            if (providerOffersWithLocation.length > 0) {
              const [custLat, custLng] = req.location.split(',').map(Number);
              withinDistance = providerOffersWithLocation.some(o => {
                const [provLat, provLng] = o.providerLocation.split(',').map(Number);
                return getDistanceInKm(custLat, custLng, provLat, provLng) <= 10;
              });
            }
          }

          if (!withinDistance) continue;

          if (req.status === 'open') {
            const providerHasSentOffer = offers.some(o => o.providerId === user.uid);
            temp.push({ ...req, offers, providerHasSentOffer });
            continue;
          }

          const accepted = offers.filter(o => o.providerId === user.uid && o.status === 'accepted');
          if (accepted.length > 0) {
            temp.push({ ...req, offers: accepted, providerHasSentOffer: true });
          }
        }
      }

      setRequests(temp);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.log('loadRequests error', err);
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Real-time listeners (REPLACEMENT)
  /*
    - Attaches serviceRequests listener.
    - Attaches per-request offers listeners that update UI immediately.
    - Plays notifications (deduped) exactly like your prior code.
  */
  // -------------------------
  useEffect(() => {
    let unsubRequests = null;
    // persist unsub map between renders
    const unsubOffersByRequest = {};
    // also keep ref to it so cleanup (outside scope) can access latest
    const unsubOffersByRequestRef = { current: unsubOffersByRequest };

    let mounted = true;

    const attachOffersListener = (requestId, requestDocData, u) => {
      // avoid attaching twice
      if (unsubOffersByRequest[requestId]) return;

      const offersRef = firestore().collection('serviceRequests').doc(requestId).collection('offers');

      const unsub = offersRef.onSnapshot(snap => {
        if (!mounted) return;

        // build offers array from snapshot (ordered by sentAt desc if present)
        const offersList = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            // if you use sentAt (Firestore Timestamp) prefer this ordering,
            // otherwise fallback to insertion order as provided by docs.
            const aTime = a.sentAt && a.sentAt.seconds ? a.sentAt.seconds : 0;
            const bTime = b.sentAt && b.sentAt.seconds ? b.sentAt.seconds : 0;
            return bTime - aTime;
          });

          // AUTO-DELETE EXPIRED OFFERS (NEW FEATURE)
          if ((u.role || 'customer').toLowerCase() === 'customer') {
            const now = Date.now();

            snap.docs.forEach(docSnap => {
              const d = docSnap.data();

              // If offer has expiresAt and time is up and still pending -> delete it
              if (d.expiresAt && d.expiresAt <= now && d.status === 'pending') {
                docSnap.ref.delete(); // This removes it from Firestore automatically
              }
            });
          }

        // Update UI: update the one request's offers in state immediately
        setRequests(prev => {
          let found = false;
          const next = prev.map(r => {
            if (r.id === requestId) {
              found = true;
              // preserve existing fields from r, replace offers with visible ones for customers
              if ((u.role || 'customer').toLowerCase() === 'customer') {
                // same filtering logic as loadRequests: hide rejected
                const visibleOffers = offersList.filter(o => o.status !== 'rejected');
                return { ...r, offers: visibleOffers };
              } else {
                // providers may want full offers (or custom slicing)
                return { ...r, offers: offersList };
              }
            }
            return r;
          });

          // If request not in prev (e.g. just created) optionally add it (so customers see offers on new requests)
          if (!found && (u.role || 'customer').toLowerCase() === 'customer') {
            // If this request belongs to user, insert a minimal request entry with offers
            if (requestDocData && requestDocData.customerId === u.uid) {
              return [{ id: requestId, ...requestDocData, offers: offersList }, ...prev];
            }
          }

          return next;
        });

        // dedupe notifications and play as before
        snap.docChanges().forEach(change => {
          const data = change.doc.data();
          const offerId = change.doc.id;

          // Customer hears new offers for their requests
          if ((u.role || 'customer').toLowerCase() === 'customer') {
            if (requestDocData && requestDocData.customerId === u.uid && change.type === 'added') {
              if (!knownOfferIds.current.has(offerId)) {
                knownOfferIds.current.add(offerId);
                playNotification();
              }
            }
          }

          let found = null;
          // Provider hears if their offer got accepted
          if ((u.role || 'customer').toLowerCase() === 'provider') {
            if (data.providerId === u.uid && change.type === 'modified' && data.status === 'accepted') {
              if (!knownAcceptedOfferIds.current.has(offerId)) {
                knownAcceptedOfferIds.current.add(offerId);
                playNotification();
                  found = {
                    requestId,
                    offerId: offerId,
                    providerId: u.uid,
                  };

                    console.log("found==",found);
                if (found) startGPS(found);
                  // setMapCoords({
                  //   customerLat: parseFloat(data.customerLat),
                  //   customerLng: parseFloat(data.customerLng),
                  //   // providerLat: parseFloat(data.customerLat), // placeholder
                  //   // providerLng: parseFloat(data.customerLng), // placeholder
                  // });
                  // setShowMapModal(true);
                
              }
            }
          }
        });

      }, err => console.log(`offers onSnapshot error for ${requestId}`, err));

      unsubOffersByRequest[requestId] = unsub;
      unsubOffersByRequestRef.current = unsubOffersByRequest;
    };

    (async () => {
      const uStr = await AsyncStorage.getItem('user');
      if (!uStr) return;
      const u = JSON.parse(uStr);

      // LISTEN: serviceRequests collection — detect newly added requests
      unsubRequests = firestore()
        .collection('serviceRequests')
        .onSnapshot(async snapshot => {
          if (!mounted) return;

          // If provider - detect added docs and notify (same behavior as before)
          if ((u.role || 'customer').toLowerCase() === 'provider') {
            snapshot.docChanges().forEach(change => {
              if (change.type === 'added') {
                const id = change.doc.id;
                if (!knownRequestIds.current.has(id)) {
                  knownRequestIds.current.add(id);
                  playNotification();
                }
                // Attach offers listener for newly added request for provider
                attachOffersListener(id, change.doc.data(), u);
              }
            });
          }

          // For customers, when a request is added that belongs to them, attach offers listener so they get offers for that new request
          if ((u.role || 'customer').toLowerCase() === 'customer') {
            snapshot.docChanges().forEach(change => {
              if (change.type === 'added') {
                const doc = change.doc;
                if (doc.data().customerId === u.uid) {
                  attachOffersListener(doc.id, doc.data(), u);
                }
              }
            });
          }

          // Refresh displayed list after any change (keeps full sync)
          // but note: offers listeners above will already update UI per-request quickly
          loadRequests();
        }, err => console.log('serviceRequests onSnapshot err', err));

      // Attach offers listeners for initial set of requests
      const allRequestsSnap = await firestore().collection('serviceRequests').get();
      allRequestsSnap.docs.forEach(doc => {
        const requestId = doc.id;
        const data = doc.data();

        if ((u.role || 'customer').toLowerCase() === 'provider') {
          // provider: listen to all requests (so they can detect accepted offers for their providerId)
          attachOffersListener(requestId, data, u);
        } else {
          // customer: attach only for requests that belong to them
          if (data.customerId === u.uid) {
            attachOffersListener(requestId, data, u);
          }
        }
      });
    })();

    return () => {
      mounted = false;
      // cleanup offer listeners
      Object.values(unsubOffersByRequestRef.current || {}).forEach(fn => {
        try { fn(); } catch (e) { }
      });
      // cleanup serviceRequests listener
      try { if (unsubRequests) unsubRequests(); } catch (e) { }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadRequests]);


  // -------------------------
  // Accept Offer function (customer)
  // -------------------------
  const acceptOffer = async (requestId, offer) => {
    try {
      const ref = firestore().collection('serviceRequests').doc(requestId);
      const batch = firestore().batch();

      batch.update(ref.collection('offers').doc(offer.id), { status: 'accepted' });

      const all = await ref.collection('offers').get();
      all.forEach(d => {
        if (d.id !== offer.id) batch.update(d.ref, { status: 'rejected' });
      });

      batch.update(ref, {
        status: 'in-progress',
        acceptedProviderId: offer.providerId,
      });

      await batch.commit();

      
      // play local acceptance sound & show alert
      playNotification();
         // ===============================
    // 🔥 PASTE CHAT CODE RIGHT HERE
    // ===============================
const chatRef = await firestore().collection('chats').add({
  requestId,
  customerId: currentUser.uid,
  providerId: offer.providerId,
  participants: [currentUser.uid, offer.providerId],
  createdAt: firestore.FieldValue.serverTimestamp(),
  lastMessage: '',
});

      Alert.alert('Success', 'Offer accepted');

      const reqDoc = await ref.get();
    const pickup = reqDoc.data().location;
    const [lat1, lng1] = pickup.split(',').map(Number);

   navigation.navigate('MapViewScreen', {
    lat1,
    lng1,
    lat2,
    lng2,
    requestId,
    offerId: offer.id,
    providerId: offer.providerId
  });

      //  navigation.navigate('ContractScreen', {
      //   loginUserId: currentUser.uid,
      //   otherUserId: offer.providerId,
      //   requestId,
      // });

      loadRequests();
    } catch (err) {
      console.log('acceptOffer error', err);
      Alert.alert('Error', 'Failed to accept offer');
    }
  };

  // -------------------------
  // Refresh handler
  // -------------------------
  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  // -------------------------
  // Helper to format sentAt
  // -------------------------
  const formatSentAt = value => {
    try {
      if (!value) return '';
      if (value.seconds) return new Date(value.seconds * 1000).toLocaleString();
      return new Date(value).toLocaleString();
    } catch {
      return '';
    }
  };

  // -------------------------
  // UI: Loading
  // -------------------------
  if (loading) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#2eb872" />
      <Text style={styles.loadingText}>Loading, please wait...</Text>
    </View>
  );
}

  // -------------------------
  // RENDER
  // -------------------------
  return (
  <View style={styles.pageBackground}>
    <StatusBar barStyle="dark-content" backgroundColor="#f3f6f7" />
  {/* {showMapModal && (
  <Modal visible={showMapModal} animationType="slide" transparent={false}>
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={{ position: 'absolute', top: 40, right: 20, zIndex: 999 }}
        onPress={() => setShowMapModal(false)}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Close</Text>
      </TouchableOpacity>

      <WebView
        ref={mapRef}
        originWhitelist={['*']}
        source={{ html: `
          <!DOCTYPE html>
          <html>
          <head>
          <meta name="viewport" content="initial-scale=1.0,width=device-width" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />
          <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
          <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
          <style>
          body, html { margin:0; padding:0; width:100%; height:100%; }
          #map { height:100vh; width:100vw; }
          .eta-box {
            background: white;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            margin-top: 12px;
            margin-right: 12px;
          }
          </style>
          </head>
          <body>
          <div id="map"></div>
          <script>
          var customerLat = ${mapCoords.customerLat};
          var customerLng = ${mapCoords.customerLng};
          var providerLat = ${mapCoords.providerLat};
          var providerLng = ${mapCoords.providerLng};

          var map = L.map('map').setView([(customerLat + providerLat)/2, (customerLng + providerLng)/2], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20 }).addTo(map);

          var customerIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/128/15735/15735364.png', iconSize: [50,50], iconAnchor: [25,50] });
          var providerIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/128/741/741407.png', iconSize: [50,50], iconAnchor: [25,50] });

          var customerMarker = L.marker([customerLat, customerLng], { icon: customerIcon }).addTo(map);
          var providerMarker = L.marker([providerLat, providerLng], { icon: providerIcon }).addTo(map);

          var routeControl = L.Routing.control({
            waypoints: [ L.latLng(providerLat, providerLng), L.latLng(customerLat, customerLng) ],
            addWaypoints: false,
            draggableWaypoints: false,
            createMarker: () => null,
            lineOptions: { styles: [{ color: "#4CAF50", weight: 5 }] }
          }).addTo(map);

          function updateProviderMarker(lat, lng) {
            providerMarker.setLatLng([lat, lng]);
            routeControl.setWaypoints([ L.latLng(lat, lng), L.latLng(customerLat, customerLng) ]);
          }

          window.updateProviderMarker = updateProviderMarker;
          </script>
          </body>
          </html>
        ` }}
      />
    </View>
  </Modal>
)} */}

    {/* ================= HEADER ================= */}
    <View style={styles.header}>
      <TouchableOpacity style={styles.profileRow} onPress={() => navigation.navigate('ProfileScreen')}>
        <Image source={{ uri: currentUser?.photo }} style={styles.profileImage} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.name} numberOfLines={1}>{currentUser?.name}</Text>
          <Text style={styles.smallMuted}>
            {(currentUser?.role || 'Customer').toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuIconBg}>
        <ListFilter size={22} color="#1D2671" />
      </TouchableOpacity>
    </View>

    {/* ================= PROMO BANNER ================= */}
    <View style={styles.promoBanner}>
      <View style={{ flex: 1 }}>
        <Text style={styles.bannerTitle}>Boost Your Projects</Text>
        <Text style={styles.bannerDesc}>
          Hire skilled engineers and get your tasks done faster and smarter.
        </Text>
      </View>

      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/128/17521/17521648.png' }}
        style={styles.bannerImage}
        resizeMode="contain"
      />
    </View>

    {/* ================= REQUEST LIST ================= */}
    <FlatList
      style={{ marginTop: hp('22%') }}
      data={requests}
      keyExtractor={item => item.id}
      contentContainerStyle={{ paddingBottom: 160 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2eb872" />
      }
      renderItem={({ item: request }) => {
        const providerOffer =
          request.offers &&
          request.offers.find(o => o.providerId === currentUser?.uid) || null;

        const hasProviderSentOffer = !!providerOffer;

        let relationStatus = 'No relation';
        if (request.status === 'in-progress' && request.acceptedProviderId) {
          if (request.acceptedProviderId === currentUser?.uid)
            relationStatus = 'Connected (You)';
          else relationStatus = 'Connected';
        } else if (hasProviderSentOffer) {
          relationStatus = 'Offer Sent';
        } else if (request.status === 'open') {
          relationStatus = 'Open';
        }

        return (
          <View style={styles.requestBlock}>
            <Text style={styles.heading}>Request: {request.title || '—'}</Text>

            {userType === 'customer' && (
              <CustomerRequestCard
                request={request}
                relationStatus={relationStatus}
                navigation={navigation}
                styles={styles}
              />
            )}

            {userType === 'customer' && request.offers?.map(offer => (
              <OfferItem
                key={offer.id}
                offer={offer}
                request={request}
                navigation={navigation}
                currentUser={currentUser}
                acceptOffer={acceptOffer}
                formatSentAt={formatSentAt}
                styles={styles}
                onExpire={async (offerId) => {
                  try {
                    setRequests(prev =>
                      prev.map(r => {
                        if (r.id !== request.id) return r;
                        return {
                          ...r,
                          offers: r.offers.filter(o => o.id !== offerId),
                        };
                      })
                    );

                    const offerRef = firestore()
                      .collection('serviceRequests')
                      .doc(request.id)
                      .collection('offers')
                      .doc(offerId);

                    const offerDoc = await offerRef.get();

                    if (offerDoc.exists && offerDoc.data().status === 'pending') {
                      await offerRef.delete();
                    }
                  } catch (err) {
                    console.log('Failed to delete expired offer', err);
                  }
                }}
              />
            ))}

            {userType === 'provider' && (
              <ProviderRequestCard
                request={request}
                offerId={Offer}
                relationStatus={relationStatus}
                navigation={navigation}
                formatSentAt={formatSentAt}
                styles={styles}
              />
            )}

            {userType === 'provider' && hasProviderSentOffer && providerOffer && (
              <ProviderOwnOfferCard
                providerOffer={providerOffer}
                navigation={navigation}
                request={request}
                currentUser={currentUser}
                formatSentAt={formatSentAt}
                styles={styles}
              />
            )}
          </View>
        );
      }}
      ListEmptyComponent={
        <Text style={styles.noRequestText}>
          {userType === 'provider'
            ? 'Listening for Requests'
            : 'Listening for Offers'}
        </Text>
      }
    />
  </View>
);

};

// ---------------------------
// Styles
// ---------------------------
// ---------------------------
// Styles
// ---------------------------
const styles = StyleSheet.create({
  pageBackground: {
    flex: 1,
    backgroundColor: '#f3f6f7',
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
  },

  /* ================= HEADER ================= */
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 999,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },

  profileRow: { flexDirection: 'row', alignItems: 'center' },

  profileImage: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#eee',
  },

  greeting: { fontSize: 12, color: '#7b7b7b' },

  name: { fontSize: 15, fontWeight: '800', color: '#1D2671' },

  smallMuted: { fontSize: 11, fontWeight: '700', color: '#2eb872' },

  menuIconBg: {
    backgroundColor: '#f1f5f2',
    padding: 10,
    borderRadius: 12,
  },

  /* ================= PROMO BANNER ================= */
  promoBanner: {
    position: 'absolute',
    top: hp('12%'),
    left: wp('5%'),
    right: wp('5%'),
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: wp('4%'),
    borderRadius: wp('5%'),
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 6,
  },

  bannerTitle: {
    fontSize: hp('2.1%'),
    fontWeight: '800',
    color: '#1D2671',
  },

  bannerDesc: {
    fontSize: hp('1.4%'),
    color: '#7b7b7b',
    marginTop: 6,
    lineHeight: hp('2%'),
  },

  bannerImage: {
    width: wp('18%'),
    height: wp('18%'),
  },

  /* ================= REQUESTS ================= */
  requestBlock: { marginBottom: hp('3%') },

  heading: {
    color: '#1D2671',
    fontWeight: '800',
    fontSize: hp('2%'),
    marginBottom: hp('1.2%'),
    marginLeft: wp('5%'),
  },

  card: {
    padding: wp('4%'),
    borderRadius: wp('4%'),
    marginHorizontal: wp('5%'),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eeeeee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },

  providerImg: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
  },

  providerName: {
    color: '#1D2671',
    fontWeight: '700',
    fontSize: hp('1.7%'),
  },

  price: {
    color: '#2eb872',
    marginTop: hp('0.4%'),
    fontWeight: '700',
    fontSize: hp('1.5%'),
  },

  message: {
    color: '#7b7b7b',
    marginTop: hp('0.6%'),
    fontSize: hp('1.4%'),
  },

  footerRow: {
    marginTop: hp('1%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sentAt: { color: '#999', fontSize: hp('1.2%') },

  acceptBtn: {
    backgroundColor: '#2eb872',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('4%'),
  },

  acceptBtnText: {
    fontWeight: '800',
    color: '#fff',
    fontSize: hp('1.5%'),
  },

  offerCard: {
    marginHorizontal: wp('7%'),
    borderRadius: wp('4%'),
    backgroundColor: '#f1f5f2',
    borderColor: '#e0efe6',
    borderWidth: 1,
  },

  offerStatus: {
    fontWeight: '800',
    fontSize: hp('1.3%'),
    color: '#2eb872',
  },

  relation: {
    color: '#2eb872',
    fontWeight: '800',
    fontSize: hp('1.4%'),
  },

  noRequestText: {
    color: '#7b7b7b',
    fontSize: hp('2%'),
    textAlign: 'center',
    marginTop: hp('6%'),
    fontWeight: '700',
  },
  loading: {
  flex: 1,
  backgroundColor: '#f3f6f7',
  justifyContent: 'center',
  alignItems: 'center',
},

loadingText: {
  marginTop: 12,
  color: '#7b7b7b',
  fontSize: 14,
  fontWeight: '600',
},
});



export default HomeScreen;
