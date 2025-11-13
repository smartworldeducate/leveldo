import React, { useState } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MapPin, Search, Calendar } from 'lucide-react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Header from '../components/Header';

export default function CustomerListScreen({ navigation }) {
  const [search, setSearch] = useState('');

  const customers = [
    {
      id: 1,
      name: 'Michael Brown',
      service: 'Plumbing Service',
      joined: 'Mar 2022',
      location: 'Los Angeles, CA',
      image: 'https://i.pravatar.cc/200?img=8',
    },
    {
      id: 2,
      name: 'Sophia Turner',
      service: 'Electrical Repair',
      joined: 'Aug 2023',
      location: 'San Diego, CA',
      image: 'https://i.pravatar.cc/200?img=21',
    },
    {
      id: 3,
      name: 'James Anderson',
      service: 'Painting Service',
      joined: 'Jan 2024',
      location: 'San Francisco, CA',
      image: 'https://i.pravatar.cc/200?img=38',
    },
    {
      id: 4,
      name: 'Isabella Wilson',
      service: 'Carpentry Work',
      joined: 'Jun 2022',
      location: 'Sacramento, CA',
      image: 'https://i.pravatar.cc/200?img=56',
    },
  ];

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.service.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient
        colors={['#C33764', '#1D2671']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}>
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: hp('6%') }}>
            {filteredCustomers.map((cust) => (
              <LinearGradient
                key={cust.id}
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}>
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

                {/* View Details Button */}
                <TouchableOpacity
                  style={styles.button}
                   onPress={() => navigation.navigate('ProfileScreen', { customer: cust })}>
                  <LinearGradient
                    colors={['#1D2671', '#C33764']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}>
                    <Text style={styles.buttonText}>View Details</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            ))}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
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
    // shadowColor: '#000',
    // shadowOpacity: 0.15,
    // shadowRadius: 12,
    // elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  name: {
    fontSize: hp('2.3%'),
    fontWeight: '700',
    color: '#fff',
  },
  serviceBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  serviceText: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: hp('1.7%'),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 5,
    fontSize: hp('1.8%'),
  },
  joinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  joinText: {
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 5,
    fontSize: hp('1.8%'),
  },
  button: {
    marginTop: hp('2%'),
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: hp('2%'),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
