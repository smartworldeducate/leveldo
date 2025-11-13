import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Briefcase, UserCog, Hammer, Users, LogOut,DollarSign } from 'lucide-react-native';

export default function CustomDrawer(props) {
  return (
    <LinearGradient
      colors={['#C33764', '#1D2671']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientContainer}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.innerContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Briefcase size={32} color="#FFD700" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Leveldo</Text>
              <Text style={styles.headerSub}>Manage tasks & users</Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            <DrawerItem
              icon={<UserCog size={24} color="#FFD700" />}
              label="Project Manager"
              onPress={() => props.navigation.navigate('PMHomeScreen')}
            />
            <DrawerItem
              icon={<Hammer size={24} color="#FFD700" />}
              label="Service Provider"
              onPress={() => props.navigation.navigate('SPHomeScreen')}
            />
            <DrawerItem
              icon={<Users size={24} color="#FFD700" />}
              label="Customer"
              onPress={() => props.navigation.navigate('CustomerListScreen')}
            />
            <DrawerItem
              icon={<Briefcase size={24} color="#FFD700" />}
              label="Contracts"
              onPress={() => props.navigation.navigate('ContractScreen')}
            />
            <DrawerItem
              icon={<DollarSign size={24} color="#FFD700" />}
              label="Payments"
              onPress={() => props.navigation.navigate('PaymentScreen')}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutBtn} onPress={() => alert('Logged Out')}>
              <LogOut size={22} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

/* Drawer Item Component */
const DrawerItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
    <LinearGradient
      colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
      style={styles.itemBackground}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.itemText}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 2,
  },
  menuContainer: {
    flex: 1,
  },
  item: {
    marginBottom: 15,
    borderRadius: 18,
    overflow: 'hidden',
  },
  itemBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowOffset: { width: 0, height: 3 },
    // shadowRadius: 6,
    // elevation: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.4,
  },
  footer: {
    marginBottom: 30,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,165,0,0.25)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
});
