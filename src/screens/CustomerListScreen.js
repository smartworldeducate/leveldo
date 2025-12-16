import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MapPin, Search, Calendar } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';

export default function CustomerListScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // fetch logged-in user
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setCurrentUser(JSON.parse(userData));
    };
    fetchUser();

    // Subscribe to all Providers
    const unsubscribe = firestore()
      .collection('users')
      .where('role', '==', 'Provider')
      .onSnapshot(
        (querySnapshot) => {
          const list = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              name: data.name || 'No Name',
              service: data.servicesOffered?.[0] || 'No Service',
              joined: data.createdAt
                ? data.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : 'N/A',
              location: data.location || 'N/A',
              image: data.photo || 'https://i.pravatar.cc/200',
              requests: data.requests || [], // always real-time updated
            });
          });
          setCustomers(list);
          setLoading(false);
        },
        (error) => {
          console.error('Firestore fetch error:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  // Filter search results
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.service.toLowerCase().includes(search.toLowerCase())
  );

  // Send request to Provider
  const sendRequest = async (customer) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please log in to send a request.');
      return;
    }

    try {
      // Fetch latest data from firestore
      const custRef = firestore().collection('users').doc(customer.id);
      const custSnap = await custRef.get();
      const liveRequests = custSnap.data().requests || [];

      // prevent duplicate request
      const alreadyRequested = liveRequests.some(
        (r) => r.fromUserId === currentUser.uid
      );

      if (alreadyRequested) {
        Alert.alert('Notice', 'You have already sent a request to this provider.');
        return;
      }

      const requestObj = {
        fromUserId: currentUser.uid,
        fromUserName: currentUser.name,
        sentAt: new Date().toISOString(),
        status: 'pending',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
      };

      await custRef.set(
        { requests: firestore.FieldValue.arrayUnion(requestObj) },
        { merge: true }
      );

      Alert.alert('Success', `Request sent to ${customer.name}`);
    } catch (error) {
      console.error('Request Error:', error);
      Alert.alert('Error', 'Failed to send request: ' + (error.message || error));
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#C33764' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient
        colors={['#C33764', '#1D2671']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={{ flex: 1 }}>

          {/* Header */}
          <View style={{ marginTop: hp(6), marginHorizontal: hp(1.5) }}>
            <Header navigation={navigation} title="Customer List" />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search color="#C33764" size={20} />
            <TextInput
              placeholder="Search by name or service..."
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Customer Cards */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp('6%') }}>
            {filteredCustomers.length === 0 ? (
              <Text style={{
                color: '#fff',
                textAlign: 'center',
                marginTop: hp('5%'),
                fontSize: hp('2%'),
              }}>
                No customers found.
              </Text>
            ) : (
              filteredCustomers.map((cust) => (
                <LinearGradient
                  key={cust.id}
                  colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  <View style={styles.cardTop}>
                    <Image source={{ uri: cust.image }} style={styles.avatar} />

                    <View style={{ flex: 1, marginLeft: wp('4%') }}>
                      <Text style={styles.name}>{cust.name}</Text>

                      <View style={styles.serviceBadge}>
                        <Text style={styles.serviceText}>{cust.service}</Text>
                      </View>

                      <View style={styles.locationRow}>
                        <MapPin size={14} color="#FFD700" />
                        <Text style={styles.locationText}>{cust.location}</Text>
                      </View>

                      <View style={styles.joinRow}>
                        <Calendar size={14} color="#FFD700" />
                        <Text style={styles.joinText}>Joined {cust.joined}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Buttons */}
                  <View style={{ flexDirection: 'row', marginTop: hp('2%'), justifyContent: 'space-between' }}>
                    <TouchableOpacity
                      style={[styles.button, { flex: 0.48 }]}
                      onPress={() => navigation.navigate('ProfileScreen', { customer: cust })}
                    >
                      <LinearGradient
                        colors={['#1D2671', '#C33764']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.buttonText}>View Details</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, { flex: 0.48 }]}
                      onPress={() => sendRequest(cust)}
                    >
                      <LinearGradient
                        colors={['#1D2671', '#C33764']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.buttonText}>Send Request</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: wp('5%'),
    marginTop: hp('3%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.2%'),
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#000',
    fontSize: hp('2%'),
    fontWeight: '500',
  },
  card: {
    marginHorizontal: wp('5%'),
    marginTop: hp('2.5%'),
    borderRadius: 25,
    padding: wp('4%'),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  name: { fontSize: hp('2.3%'), fontWeight: '700', color: '#fff' },
  serviceBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  serviceText: { color: '#FFD700', fontWeight: '600', fontSize: hp('1.7%') },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { color: 'rgba(255,255,255,0.9)', marginLeft: 5, fontSize: hp('1.8%') },
  joinRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  joinText: { color: 'rgba(255,255,255,0.9)', marginLeft: 5, fontSize: hp('1.8%') },
  button: { borderRadius: 25, overflow: 'hidden' },
  buttonGradient: { paddingVertical: hp('1.5%'), alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: hp('2%'), fontWeight: '700', textTransform: 'uppercase' },
});
