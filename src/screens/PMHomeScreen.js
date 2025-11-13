import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Users,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const sampleData = [
  { id: '1', name: 'John Carter', role: 'Provider', location: 'Los Angeles, CA', status: 'Active', activity: 'Completed 5 tasks' },
  { id: '2', name: 'Alice Smith', role: 'Customer', location: 'New York, NY', status: 'Pending', activity: 'Requested service' },
  { id: '3', name: 'Bob Johnson', role: 'Provider', location: 'Chicago, IL', status: 'Active', activity: 'On-going project' },
  { id: '4', name: 'Sarah Lee', role: 'Customer', location: 'Miami, FL', status: 'Active', activity: 'Paid Invoice' },
];

export default function PMScreen() {
  const [selectedTab, setSelectedTab] = useState('All');
  const tabAnim = useRef(new Animated.Value(0)).current;

  const tabs = ['All', 'Providers', 'Customers'];

  const handleTabPress = (tabIndex) => {
    setSelectedTab(tabs[tabIndex]);
    Animated.spring(tabAnim, {
      toValue: tabIndex,
      useNativeDriver: true,
    }).start();
  };

  const filterData = () => {
    if (selectedTab === 'Providers') return sampleData.filter(d => d.role === 'Provider');
    if (selectedTab === 'Customers') return sampleData.filter(d => d.role === 'Customer');
    return sampleData;
  };

  const renderItem = ({ item }) => (
    <LinearGradient
      colors={['#C33764', '#1D2671']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.roleIcon}>
          {item.role === 'Provider' ? <User color="#fff" size={22} /> : <Users color="#fff" size={22} />}
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardRole}>{item.role}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#00FF7F' : '#FFA500' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.activityRow}>
          <Calendar color="#fff" size={16} />
          <Text style={styles.cardText}>{item.activity}</Text>
        </View>
        <View style={styles.activityRow}>
          <DollarSign color="#fff" size={16} />
          <Text style={styles.cardText}>{item.location}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.viewButton} onPress={() => alert(`Viewing ${item.name}'s details`)}>
        <LinearGradient
          colors={['#5a1d6a', '#c33764']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.viewGradient}
        >
          <Text style={styles.viewText}>View Details</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );

  const tabWidth = width / tabs.length;

  return (
    <LinearGradient
      colors={['#1D2671', '#C33764']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Project Manager Dashboard</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={styles.tabButton}
              onPress={() => handleTabPress(index)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
          <Animated.View
            style={[
              styles.tabIndicator,
              { transform: [{ translateX: tabAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [0, tabWidth, tabWidth * 2] }) }] },
              { width: tabWidth - 20 }
            ]}
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={filterData()}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: StatusBar.currentHeight + 15,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 15 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabText: { color: '#fff', fontWeight: '500', fontSize: 16 },
  activeTabText: { color: '#1D2671', fontWeight: '700' },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  listContent: { paddingHorizontal: 15, paddingBottom: 30, paddingTop: 10 },
  card: {
    marginBottom: 15,
    borderRadius: 18,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 7,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardRole: { color: '#fff', fontSize: 14 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  cardBody: { marginBottom: 10 },
  activityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardText: { color: '#fff', marginLeft: 6, fontSize: 14 },
  viewButton: { marginTop: 8 },
  viewGradient: { borderRadius: 20, paddingVertical: 10, alignItems: 'center' },
  viewText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
