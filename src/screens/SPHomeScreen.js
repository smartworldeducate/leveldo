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
import { Star, MapPin, Search } from 'lucide-react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Header from '../components/Header';

export default function SPHomeScreen({ navigation }) {
  const [search, setSearch] = useState('');

  const providers = [
    {
      id: 1,
      name: 'John Carter',
      role: 'Professional Plumber',
      rating: 4.5,
      location: 'Los Angeles, CA',
      image: 'https://i.pravatar.cc/200?img=12',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Electrician',
      rating: 4.8,
      location: 'San Diego, CA',
      image: 'https://i.pravatar.cc/200?img=32',
    },
    {
      id: 3,
      name: 'Mark Robinson',
      role: 'Home Painter',
      rating: 4.2,
      location: 'San Francisco, CA',
      image: 'https://i.pravatar.cc/200?img=45',
    },
    {
      id: 4,
      name: 'Emma Davis',
      role: 'Carpenter',
      rating: 4.7,
      location: 'Sacramento, CA',
      image: 'https://i.pravatar.cc/200?img=56',
    },
  ];

  const filteredProviders = providers.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase())
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
            <Header navigation={navigation} title="Top Service Providers" />
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Search color="#C33764" size={20} />
            <TextInput
              placeholder="Search name or service..."
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Provider Cards */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: hp('5%') }}>
            {filteredProviders.map((provider) => (
              <LinearGradient
                key={provider.id}
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}>
                <View style={styles.cardTop}>
                  <Image source={{ uri: provider.image }} style={styles.avatar} />
                  <View style={{ flex: 1, marginLeft: wp('4%') }}>
                    <Text style={styles.name}>{provider.name}</Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleText}>{provider.role}</Text>
                    </View>

                    {/* Rating */}
                    <View style={styles.ratingContainer}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={16}
                          color={i <= Math.floor(provider.rating) ? '#FFD700' : '#bbb'}
                          fill={i <= Math.floor(provider.rating) ? '#FFD700' : 'none'}
                          style={i <= Math.floor(provider.rating) && styles.starGlow}
                        />
                      ))}
                      <Text style={styles.ratingText}>{provider.rating}</Text>
                    </View>

                    {/* Location */}
                    <View style={styles.locationRow}>
                      <MapPin size={14} color="#FFD700" />
                      <Text style={styles.locationText}>{provider.location}</Text>
                    </View>
                  </View>
                </View>

                {/* Button */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate('ProfileScreen')}>
                  <LinearGradient
                    colors={['#1D2671', '#C33764']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}>
                    <Text style={styles.buttonText}>View Profile</Text>
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: wp('22%'),
    height: wp('22%'),
    borderRadius: wp('11%'),
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  name: {
    fontSize: hp('2.3%'),
    fontWeight: '700',
    color: '#fff',
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  roleText: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: hp('1.7%'),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.6%'),
  },
  starGlow: {
    shadowColor: '#FFD700',
    shadowOpacity: 0.7,
    shadowRadius: 6,
  },
  ratingText: {
    color: '#FFD700',
    marginLeft: 6,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  locationText: {
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
