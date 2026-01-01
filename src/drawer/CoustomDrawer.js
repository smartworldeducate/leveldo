import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Briefcase,
  ClipboardList,
  Map,
  PlusCircle,
  Layers,
  Users,
  CreditCard,
  LogOut,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* =========================
   THEME
========================= */
const theme = {
  colors: {
    background: '#FFFFFF',
    primary: '#1D2671',
    secondary: '#00D4FF',
    accent: '#FFD700',
    overlay: 'rgba(29,38,113,0.05)',
    overlayLight: 'rgba(29,38,113,0.02)',
    textPrimary: '#1D2671',
    textSecondary: '#555555',
    itemBg: '#F7F7F7',
    logoutBg: '#FFEECD',
  },
  spacing: {
    small: 10,
    medium: 16,
    large: 20,
    xl: 40,
  },
  borderRadius: 18,
  font: {
    title: 26,
    subtitle: 14,
    item: 17,
    footer: 16,
    version: 12,
  },
};

/* =========================
   CUSTOM DRAWER
========================= */
export default function CustomDrawer(props) {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      alert('Logged Out');
      props.navigation.replace('LoginScreen');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.innerContainer}>

          {/* ===== HEADER ===== */}
          <View style={styles.header}>
            <View style={[styles.logoCircle, { backgroundColor: theme.colors.overlay }]}>
              <Briefcase size={36} color={theme.colors.accent} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>
                Leveldo
              </Text>
              <Text style={[styles.headerSub, { color: theme.colors.textSecondary }]}>
                Manage tasks & users
              </Text>
            </View>
          </View>

          {/* ===== MENU ITEMS ===== */}
          <View style={styles.menuContainer}>
            <DrawerItem
              icon={<ClipboardList size={24} color={theme.colors.primary} />}
              label="Manage Request"
              onPress={() => props.navigation.navigate('PMHomeScreen')}
              theme={theme}
            />

            <DrawerItem
              icon={<Map size={24} color={theme.colors.primary} />}
              label="Test Map"
              onPress={() => props.navigation.navigate('Testmap')}
              theme={theme}
            />

            <DrawerItem
              icon={<PlusCircle size={24} color={theme.colors.primary} />}
              label="Create Request"
              onPress={() => props.navigation.navigate('CreateRequestScreen')}
              theme={theme}
            />

            <DrawerItem
              icon={<Layers size={24} color={theme.colors.primary} />}
              label="All Requests"
              onPress={() => props.navigation.navigate('ProviderRequestsScreen')}
              theme={theme}
            />

            <DrawerItem
              icon={<Users size={24} color={theme.colors.primary} />}
              label="Customer Offers"
              onPress={() => props.navigation.navigate('CustomerOffers')}
              theme={theme}
            />

            <DrawerItem
              icon={<Briefcase size={24} color={theme.colors.primary} />}
              label="Provider Requests"
              onPress={() => props.navigation.navigate('ProviderRequest')}
              theme={theme}
            />

            <DrawerItem
              icon={<CreditCard size={24} color={theme.colors.primary} />}
              label="Payments"
              onPress={() => props.navigation.navigate('PaymentScreen')}
              theme={theme}
            />
          </View>

          {/* ===== FOOTER ===== */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: theme.colors.logoutBg }]}
              onPress={handleLogout}
            >
              <LogOut size={22} color={theme.colors.primary} />
              <Text style={[styles.logoutText, { color: theme.colors.primary }]}>
                Logout
              </Text>
            </TouchableOpacity>

            <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
              Version 1.0.0
            </Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

/* =========================
   DRAWER ITEM
========================= */
const DrawerItem = ({ icon, label, onPress, theme }) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.85}>
    <LinearGradient
      colors={[theme.colors.overlay, theme.colors.overlayLight]}
      style={styles.itemBackground}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.itemBg }]}>
        {icon}
      </View>
      <Text style={[styles.itemText, { color: theme.colors.textPrimary }]}>
        {label}
      </Text>
    </LinearGradient>
  </TouchableOpacity>
);

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(29,38,113,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: theme.font.title,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: theme.font.subtitle,
    marginTop: 2,
  },

  /* Menu */
  menuContainer: {
    flex: 1,
  },
  item: {
    marginBottom: 16,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
  },
  itemBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemText: {
    fontSize: theme.font.item,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  /* Footer */
  footer: {
    marginBottom: 30,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(29,38,113,0.1)',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  logoutText: {
    fontWeight: '700',
    fontSize: theme.font.footer,
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    fontSize: theme.font.version,
  },
});
