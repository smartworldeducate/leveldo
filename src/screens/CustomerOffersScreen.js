// CustomerOffersScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import { MapPin } from 'lucide-react-native';

export default function CustomerOffersScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [requestsWithOffers, setRequestsWithOffers] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const u = await AsyncStorage.getItem('user');
      if (!u) {
        setCurrentUser(null);
        setRequestsWithOffers([]);
        setLoading(false);
        return;
      }

      const user = JSON.parse(u);
      setCurrentUser(user);

      const reqSnap = await firestore()
        .collection('serviceRequests')
        .where('customerId', '==', user.uid)
        .get();

      if (reqSnap.empty) {
        setRequestsWithOffers([]);
        setLoading(false);
        return;
      }

      const requestsData = reqSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const temp = [];

      requestsData.forEach(req => {
        firestore()
          .collection('serviceRequests')
          .doc(req.id)
          .collection('offers')
          .orderBy('sentAt', 'desc')
          .onSnapshot(snapshot => {
            const offers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            const idx = temp.findIndex(r => r.id === req.id);
            if (idx >= 0) temp[idx] = { ...req, offers };
            else temp.push({ ...req, offers });
            setRequestsWithOffers([...temp]);
            setLoading(false);
            setRefreshing(false);
          });
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // const acceptOffer = async (requestId, offer) => {
  //   try {
  //     const requestRef = firestore().collection('serviceRequests').doc(requestId);

  //     const batch = firestore().batch();

  //     batch.update(requestRef.collection('offers').doc(offer.id), { status: 'accepted' });

  //     const others = await requestRef.collection('offers').get();
  //     others.forEach(d => {
  //       if (d.id !== offer.id) batch.update(d.ref, { status: 'rejected' });
  //     });

  //     batch.update(requestRef, {
  //       status: 'in-progress',
  //       acceptedProviderId: offer.providerId,
  //     });

  //     await batch.commit();

  //     Alert.alert('Success', 'Offer accepted');

  //     navigation.navigate('ContractScreen', {
  //       loginUserId: currentUser.uid,
  //       otherUserId: offer.providerId,
  //       requestId: requestId,
  //     });
  //   } catch (err) {
  //     Alert.alert('Error', 'Failed to accept offer');
  //   }
  // };



  const acceptOffer = async (requestId, offer, request) => {
    // console.log("request==",request?.location,offer?.providerLocation);
  try {
    const requestRef = firestore().collection('serviceRequests').doc(requestId);

    const batch = firestore().batch();

    // Accept this offer
    batch.update(requestRef.collection('offers').doc(offer.id), { status: 'accepted' });

    // Reject other offers
    const others = await requestRef.collection('offers').get();
    others.forEach(d => {
      if (d.id !== offer.id) batch.update(d.ref, { status: 'rejected' });
    });

    // Update request status
    batch.update(requestRef, {
      status: 'in-progress',
      acceptedProviderId: offer.providerId,
    });

    await batch.commit();

    Alert.alert('Success', 'Offer accepted');

    // -------------------------------
    // Get customer & provider location
    // -------------------------------
    const customerLocation = request?.location;
    const providerLocation = offer?.providerLocation;

    if (!customerLocation || !providerLocation) {
      return Alert.alert("Error", "Location missing!");
    }

    const [lat1, lng1] = customerLocation.split(',').map(Number);
    const [lat2, lng2] = providerLocation.split(',').map(Number);

    // Navigate to MapViewScreen
   await navigation.navigate("Mapview", { lat1, lng1, lat2, lng2 });

  } catch (err) {
    console.log(err);
    Alert.alert('Error', 'Failed to accept offer');
  }
};



  const openLocationInMaps = (location) => {
    if (!location) return;
    const [latitude, longitude] = location.split(',');
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    navigation.navigate("MapViewScreen", { url });
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  // if (requestsWithOffers.length === 0) {
  //   return (
  //     <LinearGradient colors={['#1D2671', '#C33764']} style={styles.noRequest}>
  //       <Text style={styles.noRequestText}>You don’t have any active requests or offers.</Text>
  //     </LinearGradient>
  //   );
  // }

  return (
    <LinearGradient colors={['#00D4FF', '#090979']} style={{ flex: 1 }}>
      <View style={{ marginTop: hp(6), marginHorizontal: hp(1.5) }}>
        <Header navigation={navigation} title="Provider Offers" />
      </View>

      {requestsWithOffers.length === 0 && (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}> <Text style={styles.noRequestText}>You don’t have any active requests or offers.</Text></View>)}

      <FlatList
        data={requestsWithOffers}
        keyExtractor={r => r.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ padding: wp(4), paddingBottom: 30 }}
        renderItem={({ item: request }) => (
          <View style={{ marginBottom: 25 }}>
            <Text style={styles.heading}>Offers for: {request.title || 'Untitled Request'}</Text>

            {request.offers.length === 0 ? (
              <Text style={styles.noOffers}>No offers yet</Text>
            ) : (
              <FlatList
                data={request.offers.filter(o => o.status !== 'rejected')}
                keyExtractor={o => o.id}
                renderItem={({ item: offer }) => (
                  <LinearGradient colors={['#ffffff10', '#ffffff05']} style={styles.card}>
                    <View style={styles.row}>
                      <Image
                        source={{ uri: offer.providerImage }}
                        style={styles.providerImg}
                      />

                      <View style={{ marginLeft: 14, flex: 1 }}>
                        <Text style={styles.providerName}>{offer.providerName}</Text>
                        <Text style={styles.price}>💲 {offer.offeredPrice}</Text>
                        <Text style={styles.message} numberOfLines={2}>{offer.message}</Text>

                        {/* Provider Location with Lucide Icon */}
                        {offer.providerLocation ? (
                          <TouchableOpacity
                            onPress={() => openLocationInMaps(offer.providerLocation)}
                            style={styles.locationRow}
                          >
                            <MapPin size={16} color="#FFD700" />
                            <Text style={styles.locationText}>View Location</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.footerRow}>
                      <Text style={styles.sentAt}>
                        {offer.sentAt ? new Date(offer.sentAt).toLocaleString() : ''}
                      </Text>

                      {offer.status === 'pending' ? (
                        <TouchableOpacity
                          onPress={() => acceptOffer(request.id, offer,request)}
                          style={styles.acceptBtn}
                        >
                          <Text style={styles.acceptBtnText}>Accept</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: offer.status === 'accepted' ? 'rgba(122, 240, 122, 1)' : '#ec8686ff' }
                        ]}>
                          <Text style={styles.statusBadgeText}>
                            {offer.status.toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                )}
              />
            )}
          </View>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1D2671' },
  noRequest: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noRequestText: { color: '#fff', fontSize: hp(2.2), fontWeight: '600', textAlign: 'center' },

  heading: { color: '#fff', fontWeight: '700', fontSize: hp(2.3), marginBottom: hp(1.2) },

  noOffers: { color: '#eee', fontSize: hp(1.8), opacity: 0.7, marginBottom: 10 },

  card: {
    padding: wp(4),
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  row: { flexDirection: 'row', alignItems: 'center' },

  providerImg: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: '#FFD700',
  },

  providerName: { color: '#fff', fontWeight: '700', fontSize: hp(2.0) },
  price: { color: '#FFD700', marginTop: 4, fontSize: hp(1.9), fontWeight: '600' },
  message: { color: '#eee', opacity: 0.85, marginTop: 6 },

  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { color: '#FFD700', fontSize: hp(1.6), marginLeft: 6 },

  footerRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sentAt: { color: '#ddd', fontSize: hp(1.5) },

  acceptBtn: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#FFD700',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },

  acceptBtnText: { color: '#1D2671', fontWeight: '700', fontSize: hp(1.8) },

  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },

  statusBadgeText: {
    color: '#000',
    fontWeight: '700',
    fontSize: hp(1.7),
  },
});
