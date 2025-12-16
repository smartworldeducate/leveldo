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
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Mail, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation();
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Logo animation
  // useEffect(() => {
  //   Animated.loop(
  //     Animated.sequence([
  //       Animated.timing(logoAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
  //       Animated.timing(logoAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
  //     ])
  //   ).start();

  //   Animated.timing(textAnim, {
  //     toValue: 1,
  //     duration: 1500,
  //     delay: 500,
  //     useNativeDriver: true,
  //   }).start();
  // }, []);

  useEffect(() => {
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
  ]).start();

  Animated.timing(textAnim, {
    toValue: 1,
    duration: 1500,
    delay: 500,
    useNativeDriver: true,
  }).start();
}, []);


  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const snapshot = await firestore()
        .collection('users')
        .where('email', '==', email.trim())
        .limit(1)
        .get();

      if (snapshot.empty) {
        Alert.alert('Login Failed', 'No account found with this email.');
        return;
      }

      const doc = snapshot.docs[0];
      const userData = doc.data();

      if (userData.password !== password) {
        Alert.alert('Login Failed', 'Incorrect password.');
        return;
      }

      const userWithId = { uid: doc.id, ...userData };
      await AsyncStorage.setItem('user', JSON.stringify(userWithId));

      navigation.replace('DrawerStack');
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.pageBackground}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  {
                    scale: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.05],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image source={{ uri: 'logo' }} style={styles.logoImage} />
          </Animated.View>

          {/* App Name */}
          <Animated.View style={{ opacity: textAnim, alignItems: 'center', marginTop: 16 }}>
            <Text style={styles.appName}>Leveldo</Text>
            <Text style={styles.tagline}>Make Your Life Easy</Text>
          </Animated.View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputRow}>
              <View style={styles.iconBox}>
                <Mail color="#6b6b6b" size={18} />
              </View>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#9b9b9b"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.iconBox}>
                <Lock color="#6b6b6b" size={18} />
              </View>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#9b9b9b"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.ctaWrapper}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={['#2eb872', '#16a34a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Login Now</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')} style={{ marginTop: 16 }}>
              <Text style={styles.signUpHint}>
                Don’t have an account? <Text style={{ fontWeight: '700', color: '#2eb872' }}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageBackground: {
    flex: 1,
    backgroundColor: '#f3f6f7',
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 36,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#fff',
    padding: 20,
    borderRadius: 28,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 6 },
    // shadowOpacity: 0.08,
    // shadowRadius: 12,
    // elevation: 3,
  },
  logoImage: { width: 120, height: 120, borderRadius: 16 },
  appName: { fontSize: 28, fontWeight: '800', color: '#1D2671' },
  tagline: { fontSize: 14, color: '#7b7b7b', marginTop: 6 },
  formContainer: { width: '100%', marginTop: 24 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  iconBox: { width: 34, alignItems: 'center' },
  input: { flex: 1, color: '#222', marginLeft: 8, fontSize: 15 },
  ctaWrapper: { marginTop: 16, borderRadius: 30, overflow: 'hidden' },
  ctaGradient: { paddingVertical: 14, alignItems: 'center', borderRadius: 30 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  signUpHint: { textAlign: 'center', color: '#7b7b7b', fontSize: 14 },
});
