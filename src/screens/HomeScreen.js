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
  Menu,
  MapPin,
  Droplet,
  Utensils,
  Users,
  CheckCircle,
  Clock,
  PlusCircle,
} from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const HomeScreen = ({ navigation }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <LinearGradient colors={['#C33764', '#1D2671']} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp('12%') }}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.profileRow}
              onPress={() => navigation.navigate('ProfileScreen')}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=3' }}
                style={styles.profileImage}
              />
              <View>
                <Text style={styles.greeting}>{greeting}</Text>
                <Text style={styles.name}>Robby G.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <LinearGradient
                colors={['#C33764', '#1D2671']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.menuIconBg}>
                <Menu size={22} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
            <StatCard icon={<CheckCircle size={26} color="#FFD700" />} label="Completed Deals" value="32" />
            <StatCard icon={<Clock size={26} color="#FFD700" />} label="Pending Deals" value="5" />
            <StatCard icon={<Users size={26} color="#FFD700" />} label="Active Customers" value="12" />
            <StatCard icon={<Droplet size={26} color="#FFD700" />} label="Services Today" value="7" />
          </ScrollView>

          {/* Top Services */}
          <Text style={styles.sectionTitle}>Top Services</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topServices}>
            {[
              { name: 'Plumbing', icon: <Utensils size={24} color="#fff" /> },
              { name: 'Electrical', icon: <Droplet size={24} color="#fff" /> },
              { name: 'Cleaning', icon: <Utensils size={24} color="#fff" /> },
              { name: 'Painting', icon: <Droplet size={24} color="#fff" /> },
              { name: 'Carpentry', icon: <Utensils size={24} color="#fff" /> },
            ].map((service, i) => (
              <ServiceCard key={i} name={service.name} icon={service.icon} />
            ))}
          </ScrollView>

          {/* Active Deals */}
          <Text style={styles.sectionTitle}>Active Deals</Text>
          <View style={styles.dealCards}>
            {[
              { customer: 'John Carter', service: 'Plumbing', location: 'Los Angeles, CA', status: 'Ongoing', price: 120, date: 'Nov 11', serviceType: 'Repair' },
              { customer: 'Alice Smith', service: 'Electrical', location: 'New York, NY', status: 'Pending', price: 200, date: 'Nov 12', serviceType: 'Installation' },
              { customer: 'Michael Brown', service: 'Cleaning', location: 'Chicago, IL', status: 'Ongoing', price: 80, date: 'Nov 10', serviceType: 'Deep Clean' },
            ].map((deal, i) => (
              <DealCard
                key={i}
                customer={deal.customer}
                service={deal.service}
                location={deal.location}
                status={deal.status}
                price={deal.price}
                date={deal.date}
                serviceType={deal.serviceType}
                onPress={() => navigation.navigate('ContractScreen')}
              />
            ))}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddDeal')}>
          <LinearGradient
            colors={['#1D2671', '#C33764']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}>
            <PlusCircle size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

/* ----- Deal Card ----- */
const DealCard = ({ customer, service, location, status, price, date, serviceType, onPress }) => (
  <TouchableOpacity style={styles.dealCard} onPress={onPress} activeOpacity={0.9}>
    {/* Top: Service & Status */}
    <View style={styles.dealTop}>
      <Text style={styles.dealService}>{service}</Text>
      <View style={[styles.statusBadge, { backgroundColor: status === 'Ongoing' ? '#4CAF50' : '#FFA500' }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>

    {/* Middle: Customer Info */}
    <View style={styles.dealInfo}>
      <Image source={{ uri: 'https://i.pravatar.cc/100?img=12' }} style={styles.customerAvatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.dealCustomer}>{customer}</Text>
        <View style={styles.dealLocation}>
          <MapPin size={16} color="#FFD700" />
          <Text style={styles.locationText}>{location}</Text>
        </View>
        <View style={styles.serviceTypeRow}>
          <Droplet size={16} color="#fff" />
          <Text style={styles.serviceTypeText}>{serviceType}</Text>
          <Clock size={16} color="#fff" style={{ marginLeft: 10 }} />
          <Text style={styles.serviceTypeText}>{date}</Text>
        </View>
      </View>
    </View>

    {/* Bottom: Price & Button */}
    <View style={styles.dealBottom}>
      <Text style={styles.priceText}>${price}</Text>
      <TouchableOpacity style={styles.viewButton} onPress={onPress}>
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

/* ----- Stat Card ----- */
const StatCard = ({ icon, label, value }) => (
  <View style={styles.statCard}>
    <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']} style={styles.statIcon}>
      {icon}
    </LinearGradient>
    <View style={{ marginLeft: wp('3%') }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

/* ----- Service Card ----- */
const ServiceCard = ({ name, icon }) => (
  <LinearGradient
    colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
    style={styles.serviceCard}>
    {icon}
    <Text style={styles.serviceName}>{name}</Text>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: wp('5%'), paddingTop: hp('4%') },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: hp('3%') },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: wp('12%'), height: wp('12%'), borderRadius: wp('6%'), marginRight: wp('3%'), borderWidth: 2, borderColor: '#FFD700' },
  greeting: { fontSize: hp('1.8%'), color: 'rgba(255,255,255,0.8)' },
  name: { fontSize: hp('2.2%'), fontWeight: '700', color: '#fff' },
  menuIconBg: { width: wp('10%'), height: wp('10%'), borderRadius: wp('5%'), alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)' },

  /* Stats */
  statsContainer: { flexDirection: 'row', marginBottom: hp('3%') },
  statCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', padding: wp('3%'), borderRadius: 15, marginRight: wp('3%') },
  statIcon: { width: wp('12%'), height: wp('12%'), borderRadius: wp('6%'), justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: hp('2%'), fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: hp('1.5%'), color: 'rgba(255,255,255,0.8)' },

  /* Top Services */
  sectionTitle: { fontSize: hp('2.2%'), fontWeight: '700', color: '#fff', marginBottom: hp('1.5%') },
  topServices: { flexDirection: 'row', marginBottom: hp('3%') },
  serviceCard: { flexDirection: 'row', alignItems: 'center', padding: wp('4%'), borderRadius: 20, marginRight: wp('3%') },
  serviceName: { marginLeft: wp('2%'), color: '#fff', fontWeight: '600', fontSize: hp('1.7%') },

  /* Deal Card */
  dealCards: { marginBottom: hp('8%') },
  dealCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: wp('4%'),
    marginBottom: hp('2%'),
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 3 },
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    // elevation: 5,
  },
  dealTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp('1%') },
  dealService: { fontSize: hp('2%'), fontWeight: '700', color: '#fff' },
  statusBadge: { paddingHorizontal: wp('3%'), paddingVertical: hp('0.5%'), borderRadius: 15 },
  statusText: { color: '#fff', fontWeight: '700' },
  dealInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: hp('1%') },
  customerAvatar: { width: wp('12%'), height: wp('12%'), borderRadius: wp('6%'), marginRight: wp('3%'), borderWidth: 1, borderColor: '#FFD700' },
  dealCustomer: { fontSize: hp('1.8%'), color: '#fff', fontWeight: '600' },
  dealLocation: { flexDirection: 'row', alignItems: 'center', marginVertical: hp('0.5%') },
  locationText: { marginLeft: 5, color: '#FFD700', fontSize: hp('1.5%') },
  serviceTypeRow: { flexDirection: 'row', alignItems: 'center', marginTop: hp('0.5%') },
  serviceTypeText: { marginLeft: 5, color: '#fff', fontSize: hp('1.5%') },
  dealBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { color: '#FFD700', fontWeight: '700', fontSize: hp('2%') },
  viewButton: { backgroundColor: '#FFD700', paddingHorizontal: wp('4%'), paddingVertical: hp('0.8%'), borderRadius: 15 },
  viewButtonText: { color: '#1D2671', fontWeight: '700' },

  /* FAB Button */
  fab: { position: 'absolute', bottom: hp('3%'), right: wp('5%'), borderRadius: 50, overflow: 'hidden' },
  fabGradient: { width: wp('16%'), height: wp('16%'), borderRadius: wp('8%'), justifyContent: 'center', alignItems: 'center' },
});

export default HomeScreen;
