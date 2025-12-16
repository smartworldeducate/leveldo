import React from 'react';
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, User, Hammer, CirclePlus } from 'lucide-react-native';

// Drawer
import CoustomDrawer from './drawer/CoustomDrawer';

// Screens
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import LinearGradient from 'react-native-linear-gradient';
import ProfileScreen from './screens/ProfileScreen';
import Test from './screens/Test';
import TestQRScanner from './screens/TestQRScanner';
import SPHomeScreen from './screens/SPHomeScreen';
import CustomerListScreen from './screens/CustomerListScreen';
import ContractScreen from './screens/ContractScreen';
import PaymentScreen from './screens/PaymentScreen';
import PMHomeScreen from './screens/PMHomeScreen';
import IncomingRequestsScreen from './screens/IncomingRequestsScreen';
import CreateRequestScreen from './screens/CreateRequestScreen';
import ProviderRequestsScreen from './screens/ProviderRequestsScreen';
import RequestDetailsScreen from './screens/RequestDetailsScreen';
import CustomerOffersScreen from './screens/CustomerOffersScreen';
import ProviderRequest from './screens/ProviderRequest';
import MapViewScreen from './screens/MapViewScreen';
import Mapview from './screens/Mapview';
import Testmap from './screens/Testmap';
import ChatScreen from './screens/ChatScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


// ✅ Bottom Tabs
function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <LinearGradient
            colors={['#fff', '#ffffff']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#000',
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <House color={color} size={24} />;
          if (route.name === 'New') return <CirclePlus color={color} size={24} />;
          if (route.name === 'Request') return <Hammer color={color} size={24} />;
          return null;
        },
        tabBarLabelStyle: styles.label,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="New" component={CreateRequestScreen} />
      <Tab.Screen name="Request" component={ProviderRequestsScreen} />
    </Tab.Navigator>
  );
}


// ✅ Drawer Stack
function DrawerStack() {
  return (
    <Drawer.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
        drawerStyle: { width: '68%' },
        overlayColor: 'transparent',
        drawerType: 'slide',
      }}
      drawerContent={(props) => <CoustomDrawer {...props} />}
    >
      <Drawer.Screen name="MainTabs" component={BottomTabs} />
    </Drawer.Navigator>
  );
}

// ✅ Root Navigation
export default function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="DrawerStack" component={DrawerStack} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="Test" component={Test} />
        <Stack.Screen name="TestQRScanner" component={TestQRScanner} />
        <Stack.Screen name="SPHomeScreen" component={SPHomeScreen} />
        <Stack.Screen name="CustomerListScreen" component={CustomerListScreen} />
        <Stack.Screen name="ContractScreen" component={ContractScreen} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="PMHomeScreen" component={PMHomeScreen} />
        <Stack.Screen name="CreateRequestScreen" component={CreateRequestScreen} />
        <Stack.Screen name="ProviderRequestsScreen" component={ProviderRequestsScreen} />
        <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
        <Stack.Screen name="CustomerOffers" component={CustomerOffersScreen} />
        <Stack.Screen name="IncomingRequestsScreen" component={IncomingRequestsScreen} />
        <Stack.Screen name="ProviderRequest" component={ProviderRequest} />
        <Stack.Screen name="MapViewScreen" component={MapViewScreen} />
        <Stack.Screen name="Mapview" component={Mapview} />
        <Stack.Screen name="Testmap" component={Testmap} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />



      </Stack.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 65,
    borderRadius: 30,
    borderTopWidth: 0,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
    color:'#000'
  },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
});
