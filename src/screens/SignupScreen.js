// SignupScreen.js (light theme rewrite — UI only, logic unchanged)
import React, { useEffect, useRef, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import ImagePicker from 'react-native-image-crop-picker';
import Geolocation from '@react-native-community/geolocation';
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
  Modal,
  FlatList,
  Platform,
  PermissionsAndroid,
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
  Plus,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    experience: '',
    photo: 'https://i.pravatar.cc/150?img=12',
  });

  // Skills modal state
  const [skillsModalVisible, setSkillsModalVisible] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Cleaning',
    'Painting',
    'HVAC',
    'Landscaping',
    'Appliance Repair',
  ]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [newSkillText, setNewSkillText] = useState('');

  // Role modal state
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [availableRoles, setAvailableRoles] = useState(['Customer', 'Provider']);
  const [selectedRole, setSelectedRole] = useState('');

  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Get current location and set into profile.location
  const getCurrentLocation = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location permission is required.');
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setProfile((p) => ({ ...p, location: `${latitude}, ${longitude}` }));
        },
        (err) => {
          Alert.alert('Location Error', err.message || 'Failed to get location.');
        },
        {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 10000,
        },
      );
    } catch (e) {
      Alert.alert('Error', e.message || String(e));
    }
  };

  const handleChange = (field, value) => setProfile((p) => ({ ...p, [field]: value }));

  // Image picker
  const openCamera = async () => {
    try {
      const image = await ImagePicker.openCamera({
        width: 400,
        height: 400,
        cropping: true,
        compressImageQuality: 0.8,
      });
      setProfile((p) => ({ ...p, photo: image.path }));
    } catch (error) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Camera Error', error.message || String(error));
      }
    }
  };

  const openGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        compressImageQuality: 0.8,
      });
      setProfile((p) => ({ ...p, photo: image.path }));
    } catch (error) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Gallery Error', error.message || String(error));
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

  // Cloudinary upload
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
    if (result?.secure_url) {
      return result.secure_url;
    } else {
      throw new Error('Image upload failed');
    }
  };

  // Skills modal handlers
  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills((prev) => prev.filter((s) => s !== skill));
    } else {
      if (selectedSkills.length >= 3) {
        Alert.alert('Limit Reached', 'You can select up to 3 skills only.');
        return;
      }
      setSelectedSkills((prev) => [...prev, skill]);
    }
  };

  const addCustomSkill = () => {
    const t = newSkillText.trim();
    if (!t) return;
    if (!availableSkills.includes(t)) {
      setAvailableSkills((s) => [t, ...s]);
    }
    if (!selectedSkills.includes(t)) {
      if (selectedSkills.length >= 3) {
        Alert.alert('Limit Reached', 'You can select up to 3 skills only.');
        return;
      }
      setSelectedSkills((s) => [t, ...s]);
    }
    setNewSkillText('');
  };

  // Save user to Firestore (logic preserved)
  const saveUser = async () => {
    const { username, email, password, phone, location, experience, photo } = profile;

    if (!username?.trim() || !email?.trim() || !password?.trim() || !phone?.trim()) {
      Alert.alert('Missing Fields', 'Please fill in full name, email, password and phone.');
      return;
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!selectedRole) {
      Alert.alert('Select Role', 'Please select your role.');
      return;
    }

    setLoading(true);

    try {
      // Check if email already exists
      const existingUserQuery = await firestore()
        .collection('users')
        .where('email', '==', email.trim().toLowerCase())
        .get();

      if (!existingUserQuery.empty) {
        Alert.alert('Email Exists', 'This email is already registered. Please login or use another email.');
        setLoading(false);
        return;
      }

      // Upload photo if needed
      let photoURL = photo;
      if (!photo.startsWith('https://res.cloudinary.com')) {
        photoURL = await uploadToCloudinary(photo);
      }

      const payload = {
        name: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        location: location || '',
        role: selectedRole,
        experience: experience || '',
        photo: photoURL || '',
        skills: selectedSkills,
        servicesOffered: [],
        contracts: [],
        feedback: [],
        rating: '',
        projects: [],
        status: '',
        payment: [],
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore().collection('users').add(payload);
      const uid = docRef.id;
      await firestore().collection('users').doc(uid).set({ uid }, { merge: true });

      const localUser = { uid, ...payload };
      await AsyncStorage.setItem('user', JSON.stringify(localUser));

      Alert.alert('Success', 'Profile created successfully!');
      navigation?.navigate('LoginScreen');
    } catch (error) {
      console.error('Firestore Error:', error);
      Alert.alert('Error', 'Failed to save profile: ' + (error.message || String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.pageBackground}>
      <StatusBar translucent barStyle="dark-content" backgroundColor="transparent" />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { opacity: fadeAnim }]}
      >
        {/* top spacing + back button */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
            <Text style={styles.backIcon}>{'‹'}</Text>
          </TouchableOpacity>
        </View>

        {/* card container (main white sheet) */}
        <View style={styles.cardContainer}>
          {/* header title */}
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Create a new account to get started and enjoy seamless access to our features.</Text>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: profile.photo }} style={styles.avatar} />
            <TouchableOpacity style={styles.cameraIcon} onPress={handleImageOption}>
              <Camera color="#1D2671" size={18} />
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          {[
            { field: 'username', placeholder: 'Full Name', icon: <User color="#6b6b6b" size={18} /> },
            { field: 'email', placeholder: 'Email Address', icon: <Mail color="#6b6b6b" size={18} /> },
            { field: 'phone', placeholder: 'Phone Number', icon: <Phone color="#6b6b6b" size={18} /> },
            {
              field: 'location',
              placeholder: 'Location',
              icon: (
                <TouchableOpacity onPress={getCurrentLocation}>
                  <MapPin color="#6b6b6b" size={18} />
                </TouchableOpacity>
              ),
            },
            { field: 'experience', placeholder: 'Experience (e.g., 5 years)', icon: <Calendar color="#6b6b6b" size={18} /> },
            { field: 'password', placeholder: 'Create Password', secure: true, icon: <Lock color="#6b6b6b" size={18} /> },
          ].map((item, index) => (
            <View key={index} style={styles.inputRow}>
              <View style={styles.iconBox}>{item.icon}</View>
              <TextInput
                style={styles.input}
                placeholder={item.placeholder}
                placeholderTextColor="#9b9b9b"
                secureTextEntry={item.secure || false}
                value={profile[item.field]}
                onChangeText={(text) => handleChange(item.field, text)}
                autoCapitalize="none"
              />
            </View>
          ))}

          {/* Role Selector */}
          <View style={[styles.inputRow, styles.selectorRow]}>
            <View style={{ flex: 1 }}>
              {selectedRole ? (
                <View style={styles.selectedRole}>
                  <Text style={styles.selectedRoleText}>{selectedRole}</Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>Select role...</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => setRoleModalVisible(true)} style={styles.openBtn}>
              <Plus color="#1D2671" size={16} />
            </TouchableOpacity>
          </View>

          {/* Skills Selector */}
          <View style={[styles.inputRow, styles.selectorRow]}>
            <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
              {selectedSkills.length === 0 ? (
                <Text style={styles.placeholderText}>Select skills...</Text>
              ) : (
                selectedSkills.map((s) => (
                  <View key={s} style={styles.skillChip}>
                    <Text style={styles.skillChipText}>{s}</Text>
                  </View>
                ))
              )}
            </View>
            <TouchableOpacity onPress={() => setSkillsModalVisible(true)} style={styles.openBtn}>
              <Plus color="#1D2671" size={16} />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.ctaWrapper}
            onPress={saveUser}
            activeOpacity={0.9}
            disabled={loading}
          >
            <LinearGradient
              colors={['#2eb872', '#16a34a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Create Account</Text>}
            </LinearGradient>
          </TouchableOpacity>

          {/* social / login hint area */}
          <View style={styles.footerRow}>
            <Text style={styles.alreadyText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation?.navigate?.('LoginScreen')}>
              <Text style={styles.signInText}> Sign in here</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.orText}>Or Continue With Account</Text>

          <View style={styles.socialRow}>
            <View style={styles.socialBtn}><Text style={styles.socialLetter}>f</Text></View>
            <View style={styles.socialBtn}><Text style={styles.socialLetter}>G</Text></View>
            <View style={styles.socialBtn}><Text style={styles.socialLetter}></Text></View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Skills Modal */}
      <Modal
        visible={skillsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSkillsModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderLight}>
              <Text style={styles.modalTitleLight}>Choose Skills (Max 3)</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSub}>Tap to select multiple skills</Text>

              <FlatList
                data={availableSkills}
                keyExtractor={(item) => item}
                numColumns={2}
                contentContainerStyle={{ paddingVertical: 12 }}
                renderItem={({ item }) => {
                  const selected = selectedSkills.includes(item);
                  return (
                    <TouchableOpacity
                      onPress={() => toggleSkill(item)}
                      activeOpacity={0.8}
                      style={[styles.skillItemLight, selected ? styles.skillItemSelectedLight : null]}
                    >
                      <Text
                        style={[
                          styles.skillItemTextLight,
                          selected ? { color: '#fff', fontWeight: '700' } : {},
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <TextInput
                  placeholder="Add custom skill"
                  placeholderTextColor="#999"
                  style={styles.customSkillInputLight}
                  value={newSkillText}
                  onChangeText={setNewSkillText}
                />
                <TouchableOpacity onPress={addCustomSkill} style={styles.addSkillBtnLight}>
                  <LinearGradient colors={['#2eb872', '#16a34a']} style={styles.addSkillGradientLight}>
                    <Text style={{ color: '#1D2671', fontWeight: '700' }}>Add</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {selectedSkills.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
                  {selectedSkills.map((skill) => (
                    <View key={skill} style={styles.selectedSkillChipLight}>
                      <Text style={styles.selectedSkillTextLight}>{skill}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
                <TouchableOpacity onPress={() => setSelectedSkills([])}>
                  <Text style={{ color: '#1D2671', fontWeight: '700' }}>Clear</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => setSkillsModalVisible(false)} style={{ marginRight: 12 }}>
                    <Text style={{ color: '#777' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSkillsModalVisible(false)}>
                    <LinearGradient colors={['#2eb872', '#16a34a']} style={styles.modalSaveBtnLight}>
                      <Text style={{ color: '#fff', fontWeight: '700' }}>Done</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Role Modal */}
      <Modal
        visible={roleModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderLight}>
              <Text style={styles.modalTitleLight}>Select Role</Text>
            </View>

            <View style={styles.modalBody}>
              <FlatList
                data={availableRoles}
                keyExtractor={(item) => item}
                contentContainerStyle={{ paddingVertical: 12 }}
                renderItem={({ item }) => {
                  const selected = selectedRole === item;
                  return (
                    <TouchableOpacity
                      onPress={() => setSelectedRole(item)}
                      activeOpacity={0.8}
                      style={[styles.skillItemLight, selected ? styles.skillItemSelectedLight : null]}
                    >
                      <Text
                        style={[
                          styles.skillItemTextLight,
                          selected ? { color: '#fff', fontWeight: '700' } : {},
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
                <TouchableOpacity onPress={() => setRoleModalVisible(false)}>
                  <LinearGradient colors={['#2eb872', '#16a34a']} style={styles.modalSaveBtnLight}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Done</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ------------ STYLES (Light theme) ------------ */
const styles = StyleSheet.create({
  pageBackground: {
    flex: 1,
    backgroundColor: '#f3f6f7', // soft off-white background
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 36,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },

  topBar: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  backBtn: {
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  backIcon: {
    fontSize: 22,
    color: '#1D2671',
    lineHeight: 24,
  },

  cardContainer: {
    width: '100%',
    // backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingTop: 26,
    paddingBottom: 28,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 10 },
    // shadowOpacity: 0.06,
    // shadowRadius: 30,
    // elevation: 8,
    minHeight: height * 0.8,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1D2671',
    textAlign: 'left',
    marginBottom: 6,
  },
  subtitle: { color: '#7b7b7b', marginBottom: 18, fontSize: 13, lineHeight: 18 },

  avatarWrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 28,
    borderWidth: 0,
    backgroundColor: '#f1f1f1',
    overflow: 'hidden',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: -8,
    right: (width / 2) - 120, // keep relative placement visually similar
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  iconBox: {
    width: 34,
    alignItems: 'center',
  },
  input: { flex: 1, color: '#222', marginLeft: 8, fontSize: 15 },

  selectorRow: {
    justifyContent: 'space-between',
  },
  placeholderText: { color: '#9b9b9b' },

  selectedRole: {
    backgroundColor: '#eef9f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dff0df',
  },
  selectedRoleText: { color: '#165c2b', fontWeight: '700' },

  openBtn: {
    marginLeft: 10,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },

  skillChip: {
    backgroundColor: '#f1f5f2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#eef6ea',
  },
  skillChipText: { color: '#2b6b3a', fontWeight: '600' },

  ctaWrapper: { marginTop: 16 },
  ctaGradient: {
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 14, alignItems: 'center' },
  alreadyText: { color: '#7b7b7b' },
  signInText: { color: '#2eb872', fontWeight: '700' },

  orText: { textAlign: 'center', color: '#b1b1b1', marginTop: 18, marginBottom: 10, fontSize: 13 },

  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  socialBtn: {
    width: 58,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  socialLetter: { fontWeight: '700', color: '#1D2671' },

  /* MODAL (light) */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  modalHeaderLight: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  modalTitleLight: { color: '#1D2671', fontSize: 18, fontWeight: '800' },
  modalBody: { padding: 16 },
  modalSub: { color: '#666', marginBottom: 8 },

  skillItemLight: {
    flex: 1,
    margin: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  skillItemSelectedLight: {
    backgroundColor: '#2eb872',
    borderColor: '#2eb872',
  },
  skillItemTextLight: { color: '#333', fontWeight: '600' },

  customSkillInputLight: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  addSkillBtnLight: { borderRadius: 10, overflow: 'hidden' },
  addSkillGradientLight: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },

  selectedSkillChipLight: {
    backgroundColor: '#f1f5f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 6,
  },
  selectedSkillTextLight: { color: '#2b6b3a', fontWeight: '700', fontSize: 14 },

  modalSaveBtnLight: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20 },
});
