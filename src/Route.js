import React from 'react';
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, User, Hammer } from 'lucide-react-native';

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
import VideoScreen from './screens/VideoScreen';
import SPHomeScreen from './screens/SPHomeScreen';
import CustomerListScreen from './screens/CustomerListScreen';
import ContractScreen from './screens/ContractScreen';
import PaymentScreen from './screens/PaymentScreen';
import PMHomeScreen from './screens/PMHomeScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Dummy Screen
function DummyScreen({ title }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, color: '#000' }}>{title}</Text>
    </View>
  );
}

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
            colors={['#5a0066', '#c8007a']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
       tabBarIcon: ({ color, size }) => {
  if (route.name === 'Home') return <House color={color} size={24} />;
  if (route.name === 'Provider') return <User color={color} size={24} />;
  if (route.name === 'Costomer') return <Hammer color={color} size={24} />;
  return null;
},
        tabBarLabelStyle: styles.label,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Provider" component={SPHomeScreen}/>
      <Tab.Screen name="Costomer" component={CustomerListScreen} />
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
        drawerStyle: { width: '68%'},
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
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
         <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="DrawerStack" component={DrawerStack} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="Test" component={Test} />
        <Stack.Screen name="TestQRScanner" component={TestQRScanner} />
        <Stack.Screen name="VideoScreen" component={VideoScreen} />
        <Stack.Screen name="SPHomeScreen" component={SPHomeScreen} />
        <Stack.Screen name="CustomerListScreen" component={CustomerListScreen} />
        <Stack.Screen name="ContractScreen" component={ContractScreen} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="PMHomeScreen" component={PMHomeScreen} />
        
        
        
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
    height: 70,
    borderTopLeftRadius:80,
    borderTopRightRadius:80,
    // borderRadius: 20,
    // elevation: 10,
    borderTopWidth: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  dummyScreen: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
});
