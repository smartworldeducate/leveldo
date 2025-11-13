import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import DashboardCard from '../components/DashboardCard';
import PrimaryButton from '../components/PrimaryButton';
import styles from '../styles/globalStyles';

export default function CustomerHomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Hi, Ayesha 👋</Text>

        <View style={{ marginTop: 12, flexDirection: 'row' }}>
          <DashboardCard title="Active Bookings" value="3" />
          <DashboardCard title="Pending Approvals" value="2" />
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <PrimaryButton onPress={() => navigation.navigate('Invoices')}>View Invoices</PrimaryButton>
            <PrimaryButton style={{ marginLeft: 12 }} onPress={() => navigation.navigate('Invoices')}>Pay Now</PrimaryButton>
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={styles.sectionTitle}>Projects</Text>

          <View style={[styles.card, { marginTop: 8 }]}>
            <Text style={{ fontWeight: '700' }}>Home Renovation</Text>
            <View style={{ height: 8, backgroundColor: '#F3F4F6', borderRadius: 8, marginTop: 8 }}>
              <View style={{ width: '75%', height: 8, backgroundColor: '#5A67D8', borderRadius: 8 }} />
            </View>
            <Text style={{ position: 'absolute', right: 18, top: 18, fontWeight: '700' }}>75%</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
