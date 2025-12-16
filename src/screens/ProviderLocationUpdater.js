import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, Easing } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProviderLocationUpdater({ requestId, offerId, providerId }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(0)).current;
console.log("requestId, offerId, providerId==",requestId, offerId, providerId);
  // Pulsing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const startWatching = async () => {
      if (!requestId || !offerId || !providerId) return;

      // Save active offer in AsyncStorage
      await AsyncStorage.setItem(
        'activeOffer',
        JSON.stringify({ requestId, offerId, providerId })
      );

      const watchId = Geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const locString = `${latitude},${longitude}`;
          setLocation({ latitude, longitude });
          setLoading(false);

          // Update Firestore
          await firestore()
            .collection('serviceRequests')
            .doc(requestId)
            .collection('offers')
            .doc(offerId)
            .update({
              providerLocation: locString,
              updatedLocationAt: Date.now(),
            });
        },
        (err) => {
          console.log('GPS ERROR:', err);
          setLoading(false);
        },
        { enableHighAccuracy: true, distanceFilter: 5 }
      );

      return () => Geolocation.clearWatch(watchId);
    };

    startWatching();
  }, [requestId, offerId, providerId]);

  if (loading || !location) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Getting your location...</Text>
      </View>
    );
  }

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 3], // grows 3x
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0], // fades out
  });

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={false}
      >
        {/* Pulsing Wave */}
        <Marker coordinate={location}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(255, 215, 0, 0.3)',
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
                position: 'absolute',
              }}
            />
            <View style={styles.providerMarker} />
          </View>
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#1D2671',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
