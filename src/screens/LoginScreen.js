import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Bike, Mail, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation();
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
  }, [logoAnim, textAnim]);

  return (
    <LinearGradient colors={['#5a1d6a', '#b21f66']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Logo */}
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

          {/* App Name & Tagline */}
          <Animated.View style={{ opacity: textAnim, alignItems: 'center', marginTop: 20 }}>
            <Text style={styles.appName}>Leveldo</Text>
            <Text style={styles.tagline}>Make Your Life Easy</Text>
          </Animated.View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputBox}>
              <Mail color="#fff" size={20} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.7)"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputBox}>
              <Lock color="#fff" size={20} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.7)"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('DrawerStack')}
            >
              <LinearGradient
                colors={['#5a1d6a', '#b21f66']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Login Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Shape */}
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
  appName: { fontSize: 32, fontWeight: '800', color: '#fff', textAlign: 'center' },
  tagline: { fontSize: 16, color: '#fff', marginTop: 6, textAlign: 'center' },
  formContainer: {
    width: '85%',
    marginTop: 30,
    alignItems: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
  },
  input: { flex: 1, color: '#fff', marginLeft: 10, fontSize: 16 },
  loginButton: { width: '100%', borderRadius: 25, overflow: 'hidden', marginTop: 15 },
  gradientButton: { paddingVertical: 14, alignItems: 'center', borderRadius: 25 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
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
