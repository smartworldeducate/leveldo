import React, { useState, useRef, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import ImagePicker from 'react-native-image-crop-picker';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Camera,
} from 'lucide-react-native';

const { height, width } = Dimensions.get('window');
const CLOUDINARY_UPLOAD_PRESET = 'profile_image';
const CLOUDINARY_CLOUD_NAME = 'dejuhbel3';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export default function SignupScreen({ navigation }) {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    profession: '',
    experience: '',
    photo: 'https://i.pravatar.cc/150?img=12',
  });

  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleChange = (field, value) => setProfile({ ...profile, [field]: value });

  // ✅ Open camera and crop image
  const openCamera = async () => {
    try {
      const image = await ImagePicker.openCamera({
        width: 400,
        height: 400,
        cropping: true,
        compressImageQuality: 0.8,
      });
      setProfile({ ...profile, photo: image.path });
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Camera Error', error.message);
      }
    }
  };

  // ✅ Open gallery and crop image
  const openGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        compressImageQuality: 0.8,
      });
      setProfile({ ...profile, photo: image.path });
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Gallery Error', error.message);
      }
    }
  };

  const handleImageOption = () => {
    Alert.alert('Profile Picture', 'Choose an option', [
      { text: 'Take Photo', onPress: openCamera },
      { text: 'Choose from Gallery', onPress: openGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ✅ Upload image to Cloudinary
  const uploadToCloudinary = async (imageUri) => {
    const data = new FormData();
    data.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    data.append('folder', 'leveldo_folder');

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: data,
    });

    const result = await response.json();
    if (result.secure_url) {
      return result.secure_url;
    } else {
      throw new Error('Image upload failed');
    }
  };

  // ✅ Save user data to Firestore
  const saveUser = async () => {
    const { username, email, password, phone, location, profession, experience, photo } = profile;

    if (!username || !email || !password || !phone) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      // Upload image first (if local)
      let photoURL = photo;
      if (!photo.startsWith('https://res.cloudinary.com')) {
        photoURL = await uploadToCloudinary(photo);
      }

      // Save data to Firestore
      const userRef = await firestore().collection('users').add({
        name: username,
        email,
        password,
        phone,
        location,
        role: profession,
        experience,
        photo: photoURL,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Profile created successfully!');
      navigation?.navigate('LoginScreen');
    } catch (error) {
      console.error('Firestore Error:', error);
      Alert.alert('Error', 'Failed to save data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#C33764', '#1D2671']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { opacity: fadeAnim }]}
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: profile.photo }} style={styles.avatar} />
          <TouchableOpacity style={styles.cameraIcon} onPress={handleImageOption}>
            <Camera color="#fff" size={22} />
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        {[
          { field: 'username', placeholder: 'Full Name', icon: <User color="#fff" size={20} /> },
          { field: 'email', placeholder: 'Email Address', icon: <Mail color="#fff" size={20} /> },
          { field: 'phone', placeholder: 'Phone Number', icon: <Phone color="#fff" size={20} /> },
          { field: 'location', placeholder: 'Location', icon: <MapPin color="#fff" size={20} /> },
          { field: 'profession', placeholder: 'Profession', icon: <Briefcase color="#fff" size={20} /> },
          { field: 'experience', placeholder: 'Experience (e.g., 5 years)', icon: <Calendar color="#fff" size={20} /> },
          { field: 'password', placeholder: 'Create Password', secure: true, icon: <Lock color="#fff" size={20} /> },
        ].map((item, index) => (
          <View key={index} style={styles.inputBox}>
            {item.icon}
            <TextInput
              style={styles.input}
              placeholder={item.placeholder}
              placeholderTextColor="rgba(255,255,255,0.7)"
              secureTextEntry={item.secure || false}
              value={profile[item.field]}
              onChangeText={(text) => handleChange(item.field, text)}
            />
          </View>
        ))}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={saveUser}
          activeOpacity={0.8}
          disabled={loading}>
          <LinearGradient
            colors={['#5a0066', '#c8007a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addGradient}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addText}>Save Profile</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: StatusBar.currentHeight || 20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 50 },
  avatarWrapper: { alignItems: 'center', marginVertical: 25, position: 'relative' },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: width / 2 - 80,
    backgroundColor: '#c8007a',
    padding: 10,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
  },
  input: { flex: 1, color: '#fff', marginLeft: 10, fontSize: 16 },
  addButton: { marginTop: 25 },
  addGradient: { borderRadius: 30, paddingVertical: 15, alignItems: 'center' },
  addText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
