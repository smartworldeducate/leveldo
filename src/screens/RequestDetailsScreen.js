import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Platform,
  PermissionsAndroid,
  Modal,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Header from '../components/Header';
import { WebView } from 'react-native-webview';

export default function RequestDetailsScreen({ route, navigation }) {
  const { requestId } = route.params;
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [providerLocation, setProviderLocation] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [tempSelectedLatLng, setTempSelectedLatLng] = useState(null);
  const webviewRef = useRef(null);

  useEffect(() => {
    const sub = firestore()
      .collection('serviceRequests')
      .doc(requestId)
      .onSnapshot(doc => {
        setRequest({ id: doc.id, ...doc.data() });
        setLoading(false);
      });

    AsyncStorage.getItem('user').then(u => u && setCurrentUser(JSON.parse(u)));

    return () => sub();
  }, [requestId]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const fetchLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) { Alert.alert('Permission denied'); return; }

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const loc = `${latitude},${longitude}`;
        setProviderLocation(loc);
        Alert.alert('Location fetched', loc);
      },
      (error) => { Alert.alert('Error getting location', error.message); },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
    );
  };

  const sendOffer = async () => {
    if (!currentUser) { Alert.alert('Login required'); return; }
    if (!offerPrice) { Alert.alert('Validation', 'Please add your price.'); return; }

    setSending(true);

    try {
      const offerPayload = {
        providerId: currentUser.uid,
        providerName: currentUser.name,
        providerPhone: currentUser.phone || '',
        providerImage: currentUser.photo || '',
        offeredPrice: Number(offerPrice),
        message: offerMessage || '',
        providerLocation,
        sentAt: new Date().toISOString(),
        expiresAt: Date.now() + 30000,
        status: 'pending',
      };

      await firestore()
        .collection('serviceRequests')
        .doc(requestId)
        .collection('offers')
        .add(offerPayload);

      Alert.alert('Success', 'Offer sent to customer.');
      setOfferPrice('');
      setOfferMessage('');
      setProviderLocation('');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to send offer.');
    } finally {
      setSending(false);
    }
  };

  const openMapPicker = async () => {
    let lat = 31.45, lng = 74.30;
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      await new Promise((resolve) => {
        Geolocation.getCurrentPosition(
          (pos) => { lat = pos.coords.latitude; lng = pos.coords.longitude; resolve(); },
          () => resolve(),
          { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
        );
      });
    }
    setTempSelectedLatLng({ lat, lng });
    setMapModalVisible(true);
  };

  const onModalDone = () => {
    if (!tempSelectedLatLng) { Alert.alert('Select Location', 'Please tap on the map to pick a location.'); return; }
    setProviderLocation(`${tempSelectedLatLng.lat},${tempSelectedLatLng.lng}`);
    setMapModalVisible(false);
  };

  const handleWebviewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.lat && data?.lng) setTempSelectedLatLng({ lat: data.lat, lng: data.lng });
    } catch (e) { console.warn('Invalid webview message', e); }
  };

  const mapHtml = (providerLat = 31.45, providerLng = 74.30, customerLat = 31.45, customerLng = 74.30) => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="initial-scale=1.0, width=device-width" />
<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
<style>
  html, body, #map { height: 100%; margin:0; padding:0; }
  .leaflet-container { touch-action: none; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map').setView([${providerLat}, ${providerLng}], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
  var customerMarker = L.marker([${customerLat}, ${customerLng}], { draggable: false }).addTo(map);
  var providerMarker = L.marker([${providerLat}, ${providerLng}], { draggable: true }).addTo(map);
  function postProviderLatLng(lat, lng) {
    if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage){
      window.ReactNativeWebView.postMessage(JSON.stringify({lat,lng}));
    }
  }
  postProviderLatLng(${providerLat}, ${providerLng});
  providerMarker.on('dragend', e => postProviderLatLng(e.target.getLatLng().lat, e.target.getLatLng().lng));
  map.on('click', e => { providerMarker.setLatLng([e.latlng.lat,e.latlng.lng]); postProviderLatLng(e.latlng.lat,e.latlng.lng); });
</script>
</body>
</html>
`;

  if (loading || !request) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#FFD700" />
    </View>
  );

  return (
    <LinearGradient colors={['#f3f6f7', '#f3f6f7']} style={{flex:1,marginVertical:hp(3)}}>
      <StatusBar translucent barStyle="dark-content" backgroundColor="transparent" />
      <ScrollView contentContainerStyle={{padding: wp(5)}}>
        {/* Request Card */}
        <LinearGradient colors={['#ffffff','#f0f0f0']} style={styles.card}>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            {request.customerImage ? (
              <Image source={{uri: request.customerImage}} style={styles.customerImg} />
            ) : (
              <View style={styles.customerImgPlaceholder} />
            )}
            <View style={{flex:1, marginLeft:12}}>
              <Text style={styles.title}>{request.title}</Text>
              <Text style={styles.desc}>{request.description}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.small}>Budget: {request.budget ? `$${request.budget}` : 'N/A'}</Text>
            <Text style={styles.small}>Posted by: {request.customerName}</Text>
          </View>
        </LinearGradient>

        {/* Offer Form */}
        <View style={{marginTop:20}}>
          <Text style={styles.label}>Your Offer Price</Text>
          <TextInput
            placeholder="e.g. 200"
            value={offerPrice}
            onChangeText={setOfferPrice}
            style={styles.input}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Message (optional)</Text>
          <TextInput
            placeholder="Short message..."
            value={offerMessage}
            onChangeText={setOfferMessage}
            style={[styles.input, {height:100}]}
            multiline
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Your Location</Text>
          <TouchableOpacity activeOpacity={0.9} onPress={openMapPicker}>
            <TextInput
              placeholder="Press to choose location on map"
              value={providerLocation}
              style={styles.input}
              editable={false}
              pointerEvents="none"
              placeholderTextColor="#999"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={fetchLocation} style={styles.locationBtn}>
            <LinearGradient colors={['#2eb872', '#16a34a']} style={styles.sendBtn}>
              <Text style={styles.sendBtnText}>Use Current Location</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={{marginTop:20, borderRadius:30, overflow:'hidden'}} onPress={sendOffer} disabled={sending}>
            <LinearGradient colors={['#2eb872', '#16a34a']} style={styles.sendBtn}>
              {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendBtnText}>Send Offer</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={mapModalVisible} animationType="slide" onRequestClose={() => setMapModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{ flexDirection: 'row', justifyContent:'space-between', alignItems:'center', padding:12, paddingTop: Platform.OS==='ios'?50:12, backgroundColor:'#1D2671' }}>
            <TouchableOpacity onPress={() => setMapModalVisible(false)} style={{ padding:8 }}>
              <Text style={{ color:'#fff', fontWeight:'700' }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ color:'#fff', fontWeight:'700', fontSize:16 }}>Select Location</Text>
            <TouchableOpacity onPress={onModalDone} style={{ padding:8 }}>
              <Text style={{ color:'#FFD700', fontWeight:'900' }}>Done</Text>
            </TouchableOpacity>
          </View>

          <WebView
            ref={webviewRef}
            originWhitelist={['*']}
            source={{ html: mapHtml(
              tempSelectedLatLng?.lat,
              tempSelectedLatLng?.lng,
              request?.location ? Number(request.location.split(',')[0]) : 31.45,
              request?.location ? Number(request.location.split(',')[1]) : 74.30
            ) }}
            style={{ flex:1 }}
            javaScriptEnabled
            domStorageEnabled
            onMessage={handleWebviewMessage}
          />

          <View style={{ padding:12, backgroundColor:'rgba(0,0,0,0.05)' }}>
            <Text style={{ color:'#1D2671', fontWeight:'700', marginBottom:6 }}>Selected Location</Text>
            <Text style={{ color:'#1D2671' }}>
              {tempSelectedLatLng ? `${tempSelectedLatLng.lat.toFixed(6)}, ${tempSelectedLatLng.lng.toFixed(6)}` : 'Tap map to choose'}
            </Text>
            <Text style={{ color:'#1D2671', marginTop:6 }}>
              Customer Location: {request?.location || 'N/A'}
            </Text>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loading: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#f7f7f7' },
  card: {marginVertical:hp(3),padding:12, borderRadius:16, marginBottom:16, backgroundColor:'#fff' },
  customerImg: { width:60, height:60, borderRadius:30 },
  customerImgPlaceholder: { width:60, height:60, borderRadius:30, backgroundColor:'#e0e0e0' },
  title: { color:'#1D2671', fontSize: hp(2.4), fontWeight:'700' },
  desc: { color:'#555', marginTop:6, fontSize: hp(1.9) },
  small: { color:'#777', marginTop:6, fontSize: hp(1.6) },
  infoRow: { flexDirection:'row', justifyContent:'space-between', marginTop:12 },
  label: { color:'#1D2671', marginTop:12, fontWeight:'700', fontSize: hp(1.9) },
  input: {     flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eeeeee', },
  locationBtn: { marginTop:10, borderRadius:30, overflow:'hidden' },
  sendBtn: { paddingVertical:16, alignItems:'center', borderRadius:30 },
  sendBtnText: { fontWeight:'700', color:'#fff', fontSize: hp(1.9) },
});
