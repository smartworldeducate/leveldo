import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Star,
  Edit3,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  Award,
  Calendar,
} from 'lucide-react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Header from '../components/Header';

export default function ProfileScreen({ navigation }) {
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
          <View style={{marginTop: hp(6), marginHorizontal: hp(1.5)}}>
            <Header navigation={navigation} title="My Profile" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(6) }}>
            
            {/* Profile Top Section */}
            <View style={styles.topCard}>
              <View style={styles.profileRing}>
                <LinearGradient
                  colors={['#FFD700', '#C33764']}
                  style={styles.ringGradient}>
                  <Image
                    source={{ uri: 'https://i.pravatar.cc/200?img=12' }}
                    style={styles.profileImage}
                  />
                </LinearGradient>
                <TouchableOpacity
                  style={styles.editIcon}
                  onPress={() => navigation.navigate('EditProfile')}>
                  <Edit3 color="#fff" size={16} />
                </TouchableOpacity>
              </View>

              <Text style={styles.name}>John Carter</Text>
              <Text style={styles.role}>Professional Plumber</Text>

              {/* Ratings */}
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    color={i <= 4 ? '#FFD700' : '#bbb'}
                    size={20}
                    fill={i <= 4 ? '#FFD700' : 'none'}
                  />
                ))}
                <Text style={styles.ratingText}>4.2</Text>
              </View>

              <Text style={styles.quote}>
                “Delivering reliable home services with trust and quality.”
              </Text>
            </View>

            {/* Info Section */}
            <LinearGradient colors={['#fff', '#faf4f2']} style={styles.infoCard}>
              <InfoRow icon={<Phone color="#C33764" size={20} />} label="+1 555 010 3245" />
              <InfoRow icon={<Mail color="#C33764" size={20} />} label="john.carter@example.com" />
              <InfoRow icon={<MapPin color="#C33764" size={20} />} label="Los Angeles, California" />
              <InfoRow icon={<Briefcase color="#C33764" size={20} />} label="5 years experience" />
              <InfoRow icon={<Calendar color="#C33764" size={20} />} label="Joined Feb 2020" />
            </LinearGradient>

            {/* Achievements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <View style={styles.achievementCard}>
                <Award color="#FFD700" size={28} />
                <Text style={styles.achievementText}>Certified Plumbing Expert</Text>
              </View>
            </View>

            {/* Services Offered */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services Offered</Text>
              <View style={styles.servicesContainer}>
                {[
                  'Leak Repair',
                  'Pipe Installation',
                  'Drain Cleaning',
                  'Water Heater Setup',
                  'Kitchen Fittings',
                  'Emergency Services',
                ].map((service, index) => (
                  <View key={index} style={styles.serviceTag}>
                    <Text style={styles.serviceText}>{service}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Profile Completion */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Completion</Text>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={['#FFD700', '#C33764']}
                  style={styles.progressFill}
                />
              </View>
              <Text style={styles.progressText}>90% Completed</Text>
            </View>

            {/* Update Button */}
            <TouchableOpacity style={styles.button}>
              <LinearGradient
                colors={['#FFD700', '#C33764']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}>
                <Text style={styles.buttonText}>Update Profile</Text>
              </LinearGradient>
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const InfoRow = ({ icon, label }) => (
  <View style={styles.infoRow}>
    {icon}
    <Text style={styles.infoText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  topCard: {
    alignItems: 'center',
    paddingVertical: hp('4%'),
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: wp('5%'),
    marginTop: hp('3%'),
    borderRadius: 25,
    // shadowColor: '#000',
    // shadowOpacity: 0.2,
    // shadowRadius: 10,
    // elevation: 6,
  },
  profileRing: {
    position: 'relative',
    marginBottom: hp('1%'),
  },
  ringGradient: {
    padding: 3,
    borderRadius: wp('20%'),
  },
  profileImage: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('15%'),
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    backgroundColor: '#C33764',
    padding: 7,
    borderRadius: 50,
  },
  name: {
    color: '#fff',
    fontSize: hp('3%'),
    fontWeight: '700',
    marginTop: hp('1%'),
    letterSpacing: 0.5,
  },
  role: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: hp('2%'),
    marginBottom: hp('1%'),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.2%'),
  },
  ratingText: {
    color: '#FFD700',
    marginLeft: 6,
    fontWeight: '700',
  },
  quote: {
    color: '#f9f9f9',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: hp('1.2%'),
    fontSize: hp('2%'),
    lineHeight: hp('2.8%'),
  },
  infoCard: {
    marginHorizontal: wp('5%'),
    marginTop: hp('3%'),
    borderRadius: 20,
    padding: wp('5%'),
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.8%'),
  },
  infoText: {
    marginLeft: 12,
    color: '#333',
    fontSize: hp('2.1%'),
    fontWeight: '500',
  },
  section: {
    marginHorizontal: wp('5%'),
    marginTop: hp('3%'),
  },
  sectionTitle: {
    fontSize: hp('2.4%'),
    fontWeight: '700',
    color: '#fff',
    marginBottom: hp('1%'),
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: wp('3.5%'),
  },
  achievementText: {
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 10,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  serviceText: {
    color: '#fff',
    fontSize: hp('1.9%'),
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    width: '90%',
    height: '100%',
    borderRadius: 10,
  },
  progressText: {
    color: '#fff',
    fontSize: hp('1.9%'),
    marginTop: 4,
  },
  button: {
    marginHorizontal: wp('5%'),
    marginTop: hp('4%'),
    borderRadius: 30,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: hp('2.2%'),
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: hp('2.2%'),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
