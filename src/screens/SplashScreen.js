import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation();
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(logoAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Text fade animation
    Animated.timing(textAnim, { toValue: 1, duration: 1500, delay: 500, useNativeDriver: true }).start();

    // Check async storage for saved user
    const checkUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      setTimeout(() => {
        if (storedUser) {
          navigation.replace('DrawerStack');
        } else {
          navigation.replace('LoginScreen');
        }
      }, 2500);
    };

    checkUser();
  }, [logoAnim, textAnim]);

  return (
    <LinearGradient colors={['#f3f6f7', '#e0f2f1']} style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [
              {
                scale: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }),
              },
            ],
          },
        ]}
      >
        <View style={styles.iconWrapper}>
          <Image source={{ uri: 'logo' }} style={styles.logoImage} />
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: textAnim, marginTop: 16, alignItems: 'center' }}>
        <Text style={styles.appName}>Leveldo</Text>
        <Text style={styles.tagline}>Make Your Life Easy</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor: '#16a34a', },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#fff',
    padding: 20,
    // borderRadius: 28,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 6 },
    // shadowOpacity: 0.08,
    // shadowRadius: 12,
    // elevation: 3,
  },
  iconWrapper: { padding: 10, borderRadius: 16 },
  logoImage: { width: 120, height: 120, borderRadius: 16 },
  appName: { fontSize: 28, fontWeight: '800', color: '#1D2671' },
  tagline: { fontSize: 14, color: '#7b7b7b', marginTop: 6 },
});
