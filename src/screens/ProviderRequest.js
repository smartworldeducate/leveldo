// =====================
// ProviderRequest.js
// FULLY FIXED VERSION
// =====================

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';

import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { widthPercentageToDP } from 'react-native-responsive-screen';

export default function ProviderRequest() {
  const [loading, setLoading] = useState(true);
  const [activeOffer, setActiveOffer] = useState(null);

  const userRef = useRef(null);
  const watchIdRef = useRef(null);

  // ---------------------------------------------
  // 1. LOCATION PERMISSION
  // ---------------------------------------------
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

  // ---------------------------------------------
  // 2. LOAD USER FROM ASYNC STORAGE
  // ---------------------------------------------
  const loadUser = async () => {
    const u = await AsyncStorage.getItem("user");
    if (!u) return null;
    return JSON.parse(u);
  };

  // ---------------------------------------------
  // 3. FIND ACTIVE ACCEPTED OFFER
  // ---------------------------------------------
  const listenForActiveOffer = async () => {
    const user = await loadUser();
    if (!user) {
      console.log("❌ No user found in storage");
      setLoading(false);
      return;
    }

    userRef.current = user;

    console.log("👤 Current user:", user.uid);

    // Listen only serviceRequests where provider is accepted
    return firestore()
      .collection("serviceRequests")
      .where("acceptedProviderId", "==", user.uid)
      .where("status", "==", "in-progress")
      .onSnapshot(async (snap) => {
        console.log("📌 serviceRequests snapshot:", snap.size);

        if (snap.empty) {
          console.log("❌ No in-progress request found for provider");
          setActiveOffer(null);
          setLoading(false);
          return;
        }

        let found = null;

        for (const reqDoc of snap.docs) {
          const requestId = reqDoc.id;

          console.log("➡️ Checking request:", requestId);

          const offersSnap = await firestore()
            .collection("serviceRequests")
            .doc(requestId)
            .collection("offers")
            .where("providerId", "==", user.uid)
            .where("status", "==", "accepted")
            .get();

          console.log("📌 Offers found:", offersSnap.size);

          if (!offersSnap.empty) {
            const offer = offersSnap.docs[0];

            found = {
              requestId,
              offerId: offer.id,
              providerId: user.uid,
            };

            console.log("🎯 ACTIVE OFFER:", found);
            break;
          }
        }

        setActiveOffer(found);
        setLoading(false);

        if (found) startGPS(found);
      });
  };

  // ---------------------------------------------
  // 4. GPS TRACKING
  // ---------------------------------------------
  const startGPS = async (offer) => {
    const allowed = await requestLocationPermission();
    if (!allowed) {
      Alert.alert("Permission needed", "Please enable location permission.");
      return;
    }

    console.log("🟢 Starting GPS Watch for offer:", offer);

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

  // ---------------------------------------------
  // 5. INITIAL SETUP
  // ---------------------------------------------
  useEffect(() => {
    let unsub = null;

    const init = async () => {
      unsub = await listenForActiveOffer();
    };

    init();

    return () => {
      if (watchIdRef.current) {
        Geolocation.clearWatch(watchIdRef.current);
      }
      if (unsub) unsub();
    };
  }, []);

  // ---------------------------------------------
  // 6. UI
  // ---------------------------------------------
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
  <LinearGradient colors={['#00D4FF', '#090979']}  start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }} style={styles.container}>
    {activeOffer ? (
      <View style={styles.card}>
        <Text style={styles.title}>Live Tracking Active</Text>
        <Text style={styles.subtitle}>
          Request ID: <Text style={styles.highlight}>{activeOffer.requestId}</Text>
        </Text>
      </View>
    ) : (
      <View style={styles.card}>
        <Text style={styles.title}>No Active Request</Text>
        <Text style={styles.subtitle}>Waiting for new assignments...</Text>
      </View>
    )}
  </LinearGradient>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
    padding: 20,
    justifyContent: "center",
  },
 card: {
    padding: widthPercentageToDP(4),
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  highlight: {
    color: "#cdcdcd",
    fontWeight: "700",
  },
});

