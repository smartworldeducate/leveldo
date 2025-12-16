import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  PermissionsAndroid,
  Platform,
  Linking,
  Modal
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Header from '../components/Header';
import Geolocation from '@react-native-community/geolocation';
import { WebView } from 'react-native-webview';

export default function CreateRequestScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [tempSelectedLatLng, setTempSelectedLatLng] = useState(null);
  const webviewRef = useRef();

  const mapHtml = (lat = 31.45, lng = 74.30) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <style>
      html, body { height: 100%; margin:0; padding:0; }
      #map { height: 100%; width: 100%; }
      .leaflet-container { touch-action: none; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      var map = L.map('map').setView([${lat}, ${lng}], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(map);

      var marker = L.marker([${lat}, ${lng}], { draggable:true }).addTo(map);

      map.on('click', function(e){
        marker.setLatLng(e.latlng);
        if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage){
          window.ReactNativeWebView.postMessage(JSON.stringify({lat:e.latlng.lat, lng:e.latlng.lng}));
        }
      });

      marker.on('dragend', function(e){
        var pos = e.target.getLatLng();
        if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage){
          window.ReactNativeWebView.postMessage(JSON.stringify({lat: pos.lat, lng: pos.lng}));
        }
      });
    </script>
  </body>
  </html>
  `;

  const requestPermission = async () => {
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

  const getCurrentLocation = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) { Alert.alert('Permission denied'); return; }

    Geolocation.getCurrentPosition(
      (pos) => setLocation(`${pos.coords.latitude},${pos.coords.longitude}`),
      (err) => Alert.alert('Location Error', err.message),
      { enableHighAccuracy:false, timeout:30000, maximumAge:10000 }
    );
  };

  const openInMaps = () => {
    if (!location) { Alert.alert('No location available'); return; }
    const [lat, lng] = location.split(',');
    Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`).catch(()=>Alert.alert('Failed to open map'));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) { Alert.alert('Validation', 'Please add title and description.'); return; }
    setLoading(true);

    try {
      const userRaw = await AsyncStorage.getItem('user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      if (!user?.uid) { Alert.alert('Login', 'Please login to create request.'); setLoading(false); return; }

      const payload = {
        customerId: user.uid,
        customerName: user.name || '',
        customerPhone: user.phone || '',
        customerEmail: user.email || '',
        customerImage: user.photo || '',
        title: title.trim(),
        description: description.trim(),
        budget: budget ? Number(budget) : null,
        category: category || '',
        location: location || '',
        createdAt: new Date().toISOString(),
        status: 'open',
        acceptedProviderId: '',
      };

      await firestore().collection('serviceRequests').add(payload);
      Alert.alert('Success', 'Request created successfully.');
      setTitle(''); setDescription(''); setBudget(''); setCategory(''); setLocation('');
      navigation.goBack();

    } catch (err) { console.error(err); Alert.alert('Error', 'Failed to create request.'); }
    finally { setLoading(false); }
  };

  const onModalDone = () => {
    if (tempSelectedLatLng) {
      setLocation(`${tempSelectedLatLng.lat},${tempSelectedLatLng.lng}`);
    }
    setMapModalVisible(false);
  };

  const handleWebviewMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    setTempSelectedLatLng(data);
  };

  const openMapPicker = async () => {
    let lat = 31.45;
    let lng = 74.30;

    const hasPermission = await requestPermission();
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

  return (
    <LinearGradient colors={['#ffffff','#f7f7f7']} style={styles.container}>
      {/* <View style={{ marginTop: hp(6), marginHorizontal: hp(1.5) }}>
        <Header navigation={navigation} title="Create Request" />
      </View> */}

      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.label}>Title</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="e.g. Kitchen painting" placeholderTextColor="#999" />

        <Text style={styles.label}>Description</Text>
        <TextInput value={description} onChangeText={setDescription} style={[styles.input,{height:120}]} placeholder="Describe the job" multiline placeholderTextColor="#999" />

        <Text style={styles.label}>Budget</Text>
        <TextInput value={budget} onChangeText={setBudget} style={styles.input} keyboardType="numeric" placeholder="e.g. 300" placeholderTextColor="#999" />

        <Text style={styles.label}>Category</Text>
        <TextInput value={category} onChangeText={setCategory} style={styles.input} placeholder="Plumbing, Painting..." placeholderTextColor="#999" />

        <Text style={styles.label}>Location</Text>
        <View style={{ flexDirection:'row', gap:10 }}>
          <TextInput value={location} onChangeText={setLocation} style={[styles.input,{flex:1}]} placeholder="Lat, Long" placeholderTextColor="#999" />
          <TouchableOpacity onPress={getCurrentLocation} style={styles.smallBtn}>
            <Text style={{ color:'#fff', fontSize:12 }}>GPS</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={openMapPicker} disabled={loading}>
            <LinearGradient colors={['#2eb872', '#16a34a']} start={{x:0,y:1}} end={{x:1,y:0}} style={styles.btnGrad}>
                     <Text style={{color:'#fff', fontWeight:'700'}}>Pick Location on Map</Text>
          </LinearGradient>

        </TouchableOpacity>

        {/* <TouchableOpacity onPress={openInMaps} style={styles.mapBtn}>
          <Text style={{color:'#1D2671', fontWeight:'700'}}>Open in Maps</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
          <LinearGradient colors={['#2eb872', '#16a34a']} start={{x:0,y:1}} end={{x:1,y:0}} style={styles.btnGrad}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>Publish Request</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={mapModalVisible} animationType="slide" onRequestClose={() => setMapModalVisible(false)}>
        <View style={{ flex:1, backgroundColor:'#fff' }}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:12, paddingTop: Platform.OS==='ios'?50:12, backgroundColor:'#1D2671' }}>
            <TouchableOpacity onPress={()=>setMapModalVisible(false)} style={{ padding:8 }}>
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
            source={{ html: mapHtml(tempSelectedLatLng?.lat || 31.45, tempSelectedLatLng?.lng || 74.30) }}
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
          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex:1 },
  inner: { padding: wp(5), paddingBottom:50 },
  label: { color:'#1D2671', marginTop:12, marginBottom:6, fontWeight:'600', fontSize: hp(2) },
  input: { backgroundColor:'#f0f0f0', color:'#1D2671', padding:14, borderRadius:12, fontSize: hp(1.9) },
  smallBtn: { backgroundColor:'#1D2671', paddingHorizontal:12, justifyContent:'center', borderRadius:8 },
  mapBtn: { backgroundColor:'#2eb872', padding:14, borderRadius:12, marginTop:10, alignItems:'center'},
  btn: { marginTop:18, borderRadius:30, overflow:'hidden' },
  btnGrad: { paddingVertical:16, alignItems:'center' },
  btnText: { color:'#fff', fontWeight:'700', fontSize: hp(2) },
});
