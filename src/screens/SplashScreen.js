import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Bike } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation();
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Text fade-in
    Animated.timing(textAnim, {
      toValue: 1,
      duration: 1500,
      delay: 500,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      navigation.replace('SignupScreen'); // Navigate after 2.5 sec
    }, 2500);

    return () => clearTimeout(timer);
  }, [logoAnim, textAnim, navigation]);

  return (
    <LinearGradient colors={['#5a1d6a', '#b21f66']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [
              {
                scale: logoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.iconWrapper}>
          <Bike color="#fff" size={64} />
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: textAnim, alignItems: 'center', marginTop: 20 }}>
        <Text style={styles.appName}>Leveldo</Text>
        <Text style={styles.tagline}>Make Your Life Easy</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.bottomShape,
          {
            transform: [
              {
                translateY: logoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 10],
                }),
              },
            ],
          },
        ]}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center', justifyContent: 'center' },
  iconWrapper: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  appName: { fontSize: 32, fontWeight: '800', color: '#fff' },
  tagline: { fontSize: 16, color: '#fff', marginTop: 6 },
  bottomShape: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: 120,
    borderTopLeftRadius: width / 2,
    borderTopRightRadius: width / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
