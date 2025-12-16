// ProfileScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Star,
  Edit3,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  Award,
  Calendar,
  X,
} from 'lucide-react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import Geolocation from '@react-native-community/geolocation';

export default function ProfileScreen({ navigation }) {
  const modalAnim = useRef(new Animated.Value(hp('100%'))).current;
  const [loadingSave, setLoadingSave] = useState(false);

  const [user, setUser] = useState({
    uid: null,
    name: 'John Carter',
    role: 'Professional Plumber',
    phone: '+1 555 010 3245',
    email: 'john.carter@example.com',
    location: 'Los Angeles, California',
    experience: '5 years experience',
    photo: 'https://i.pravatar.cc/200?img=12',
    skills: ['Plumbing', 'Drain Cleaning'],
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ ...user });

  const [newSkill, setNewSkill] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);

  // Load user
  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          const merged = {
            uid: parsed.uid || parsed.id || null,
            name: parsed.name || parsed.fullName || user.name,
            role: parsed.role || parsed.profession || user.role,
            phone: parsed.phone || parsed.mobile || user.phone,
            email: parsed.email || user.email,
            location: parsed.location || user.location,
            experience: parsed.experience || user.experience,
            photo: parsed.photo || user.photo,
            skills: parsed.skills || user.skills,
          };
          if (mounted) {
            setUser(merged);
            setForm(merged);
          }
        }
      } catch (err) {
        console.warn('Failed loading user', err);
      }
    };
    loadUser();
    return () => (mounted = false);
  }, []);

  // Location permission
  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const getCurrentLocation = async () => {
    try {
      const hasPerm = await requestLocationPermission();
      if (!hasPerm) {
        Alert.alert("Permission Required", "Enable location permission.");
        return;
      }

      Geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          const loc = `${latitude}, ${longitude}`;
          setForm(p => ({ ...p, location: loc }));
          Alert.alert("Location Updated", "Your current location has been set.");
        },
        err => Alert.alert("Location Error", err.message),
        { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
      );
    } catch (e) {
      Alert.alert("Error", e.message || String(e));
    }
  };

  // Modal controls
  const openEdit = () => {
    modalAnim.setValue(hp("100%"));
    setShowEditModal(true);
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 360,
      useNativeDriver: true,
    }).start();
  };

  const closeEdit = () => {
    Animated.timing(modalAnim, {
      toValue: hp("100%"),
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowEditModal(false);
      setForm({ ...user });
      setShowSkillInput(false);
      setNewSkill('');
    });
  };

  // Save profile
  const handleSave = async () => {
    if (!form.name?.trim()) return Alert.alert("Validation", "Please enter your full name.");
    if (!form.email?.trim()) return Alert.alert("Validation", "Please enter your email.");

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(form.email.trim())) {
      return Alert.alert("Validation", "Enter a valid email address.");
    }

    const uid = form.uid || user.uid;
    if (!uid) return Alert.alert("Error", "No user id found.");

    setLoadingSave(true);
    try {
      const updatePayload = {
        ...form,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection("users").doc(uid).set(updatePayload, { merge: true });
      await AsyncStorage.setItem("user", JSON.stringify({ uid, ...updatePayload }));

      setUser({ uid, ...updatePayload });
      setForm({ uid, ...updatePayload });

      Alert.alert("Success", "Profile updated successfully.");
      closeEdit();
    } catch (err) {
      Alert.alert("Error", "Failed to save profile.");
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ marginTop: hp(6), marginHorizontal: hp(1.5) }}>
          <Header navigation={navigation} title="My Profile" dark />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(6) }}>

          {/* TOP CARD (White minimal) */}
          <View style={styles.topCard}>
            <View style={styles.profileRing}>
              <View style={styles.ringBorder}>
                <Image source={{ uri: user.photo }} style={styles.profileImage} />
              </View>

              <TouchableOpacity style={styles.editIcon} onPress={openEdit}>
                <Edit3 color="#fff" size={16} />
              </TouchableOpacity>
            </View>

            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.role}>{user.role}</Text>

            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} color={i <= 4 ? "#FFD700" : "#ccc"} size={20} fill={i <= 4 ? "#FFD700" : "none"} />
              ))}
              <Text style={styles.ratingText}>4.2</Text>
            </View>

            <Text style={styles.quote}>
              “Delivering reliable home services with trust & quality.”
            </Text>
          </View>

          {/* INFO CARD */}
          <View style={styles.infoCard}>
            <InfoRow icon={<Phone color="#1D2671" size={20} />} label={user.phone} />
            <InfoRow icon={<Mail color="#1D2671" size={20} />} label={user.email} />
            <InfoRow icon={<MapPin color="#1D2671" size={20} />} label={user.location} />
            <InfoRow icon={<Briefcase color="#1D2671" size={20} />} label={user.experience} />
            <InfoRow icon={<Calendar color="#1D2671" size={20} />} label="Joined Feb 2020" />
          </View>

          {/* Achievements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementCard}>
              <Award color="#1D2671" size={28} />
              <Text style={styles.achievementText}>Certified Plumbing Expert</Text>
            </View>
          </View>

          {/* Skills */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services Offered</Text>
            <View style={styles.servicesContainer}>
              {(user.skills && user.skills.length > 0
                ? user.skills
                : ["Leak Repair", "Pipe Installation", "Drain Cleaning"]
              ).map((service, i) => (
                <View key={i} style={styles.serviceTag}>
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Completion</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressText}>90% Completed</Text>
          </View>

          {/* UPDATE BUTTON */}
          <TouchableOpacity style={styles.button} onPress={openEdit}>
            <LinearGradient colors={['#2eb872', '#16a34a']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Update Profile</Text>
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>

      {/* EDIT MODAL (White Theme) */}
      {showEditModal && (
        <View style={styles.fullModalWrapper}>
          <Animated.View style={[styles.fullModalContent, { transform: [{ translateY: modalAnim }] }]}>
            {/* MODAL HEADER */}
            <LinearGradient colors={['#2eb872', '#16a34a']} style={styles.fullHeader}>
              <Text style={styles.fullHeaderTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={closeEdit} style={styles.closeButton}>
                <X color="#fff" size={22} />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp('10%') }}>
              {/* Avatar */}
              <View style={{ alignItems: "center", marginVertical: hp("2%") }}>
                <View style={styles.fullAvatarRing}>
                  <Image source={{ uri: form.photo }} style={styles.fullAvatar} />
                </View>
                <TouchableOpacity>
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>

              {/* FORM FIELDS */}
              {[
                { label: "Full Name", key: "name" },
                { label: "Profession", key: "role" },
                { label: "Phone Number", key: "phone", keyboard: "phone-pad" },
                { label: "Email", key: "email", keyboard: "email-address" },
                { label: "Location", key: "location" },
                { label: "Experience", key: "experience" },
              ].map((f, index) => (
                <View key={index} style={styles.fullInputBox}>
                  <Text style={styles.fullInputLabel}>{f.label}</Text>
                  <TextInput
                    value={form[f.key]}
                    placeholder={f.label}
                    placeholderTextColor="#888"
                    keyboardType={f.keyboard || "default"}
                    onChangeText={t => setForm(p => ({ ...p, [f.key]: t }))}
                    style={styles.fullInputField}
                  />

                  {f.key === "location" && (
                    <TouchableOpacity onPress={getCurrentLocation} style={styles.locationButton}>
                      <Text style={styles.locationButtonText}>Use My Current Location</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {/* SKILLS */}
              <View style={styles.skillsContainer}>
                <Text style={styles.fullInputLabel}>Skills</Text>

                <View style={styles.skillsRow}>
                  {form.skills?.map((sk, i) => (
                    <View key={i} style={styles.skillChip}>
                      <Text style={styles.skillChipText}>{sk}</Text>
                      <TouchableOpacity onPress={() =>
                        setForm(p => ({ ...p, skills: p.skills.filter((s, idx) => idx !== i) }))
                      }>
                        <X size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {!showSkillInput && (
                    <TouchableOpacity onPress={() => setShowSkillInput(true)} style={styles.addSkillChip}>
                      <Text style={styles.addSkillText}>+ Add Skill</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {showSkillInput && (
                  <View style={styles.addSkillRow}>
                    <TextInput
                      placeholder="Enter new skill"
                      placeholderTextColor="#888"
                      value={newSkill}
                      onChangeText={setNewSkill}
                      style={styles.addSkillInput}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        if (newSkill.trim()) {
                          setForm(p => ({ ...p, skills: [...(p.skills || []), newSkill.trim()] }));
                          setNewSkill('');
                          setShowSkillInput(false);
                        }
                      }}
                      style={styles.addSkillButton}
                    >
                      <Text style={styles.addSkillButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* SAVE BUTTON */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleSave}
                disabled={loadingSave}
                style={styles.fullSaveButton}
              >
                <LinearGradient colors={['#2eb872', '#16a34a']} style={styles.fullSaveGradient}>
                  {loadingSave ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.fullSaveText}>Save Changes</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

// InfoRow Component
const InfoRow = ({ icon, label }) => (
  <View style={styles.infoRow}>
    {icon}
    <Text style={styles.infoText}>{label}</Text>
  </View>
);

// ======================
// WHITE THEME STYLES
// ======================
const styles = StyleSheet.create({
  topCard: {
    marginTop: hp('3%'),
    marginHorizontal: wp('4%'),
    paddingVertical: hp('4%'),
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },

  profileRing: { position: "relative", marginBottom: hp("1%") },
  ringBorder: {
    padding: 4,
    borderRadius: wp("20%"),
    borderWidth: 3,
    borderColor: "#2eb872",
  },
  profileImage: {
    width: wp("30%"),
    height: wp("30%"),
    borderRadius: wp("15%"),
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 5,
    backgroundColor: "#2eb872",
    padding: 7,
    borderRadius: 50,
  },

  name: {
    color: "#222",
    fontSize: hp("3%"),
    fontWeight: "700",
  },
  role: {
    color: "#666",
    marginBottom: hp("1%"),
    fontSize: hp("2%"),
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  ratingText: {
    marginLeft: 6,
    color: "#1D2671",
    fontWeight: "700",
  },

  quote: {
    marginTop: hp("1%"),
    color: "#444",
    fontStyle: "italic",
    textAlign: "center",
    fontSize: hp("1.9%"),
    lineHeight: hp("2.6%"),
  },

  // INFO CARD (white)
  infoCard: {
    backgroundColor: "#fff",
    marginHorizontal: wp("4%"),
    marginTop: hp("3%"),
    borderRadius: 18,
    padding: wp("5%"),
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1.8%"),
  },
  infoText: {
    marginLeft: 12,
    color: "#333",
    fontSize: hp("2%"),
    fontWeight: "500",
  },

  // Sections
  section: {
    marginHorizontal: wp("4%"),
    marginTop: hp("3%"),
  },
  sectionTitle: {
    fontSize: hp("2.3%"),
    fontWeight: "700",
    color: "#111",
    marginBottom: hp("1%"),
  },

  // Achievement Card
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: wp("4%"),
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  achievementText: {
    marginLeft: 10,
    color: "#1D2671",
    fontSize: hp("2%"),
    fontWeight: "600",
  },

  // Skills
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  serviceTag: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  serviceText: {
    color: "#333",
    fontSize: hp("1.9%"),
  },

  // Progress
  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "#eee",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    width: "90%",
    height: "100%",
    backgroundColor: "#2eb872",
  },
  progressText: {
    marginTop: 4,
    color: "#444",
    fontSize: hp("1.9%"),
  },

  // Main button
  button: {
    marginHorizontal: wp("4%"),
    marginTop: hp("3%"),
    borderRadius: 25,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: hp("2%"),
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: hp("2.1%"),
  },

  // MODAL WRAPPER
  fullModalWrapper: {
    position: "absolute",
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  fullModalContent: {
    height: "90%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  fullHeader: {
    paddingVertical: hp("2%"),
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  fullHeaderTitle: {
    color: "#fff",
    fontSize: hp("2.4%"),
    fontWeight: "700",
  },
  closeButton: {
    position: "absolute",
    right: 15,
  },

  fullAvatarRing: {
    padding: 3,
    borderRadius: wp("15%"),
    borderColor: "#2eb872",
    borderWidth: 3,
  },
  fullAvatar: {
    width: wp("30%"),
    height: wp("30%"),
    borderRadius: wp("15%"),
  },
  changePhotoText: {
    color: "#2eb872",
    marginTop: 6,
    fontWeight: "600",
  },

  // FORM INPUTS
  fullInputBox: {
    marginHorizontal: wp("5%"),
    marginBottom: hp("2%"),
  },
  fullInputLabel: {
    color: "#333",
    fontWeight: "600",
    marginBottom: 4,
  },
  fullInputField: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("3%"),
    fontSize: hp("2%"),
    color: "#333",
  },

  locationButton: {
    backgroundColor: "#2eb872",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
    alignItems: "center",
  },
  locationButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  // SKILLS SECTION
  skillsContainer: {
    marginHorizontal: wp("5%"),
    marginBottom: hp("2%"),
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2eb872",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  skillChipText: {
    color: "#fff",
    marginRight: 6,
    fontWeight: "600",
  },
  addSkillChip: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addSkillText: {
    color: "#2eb872",
    fontWeight: "600",
  },

  addSkillRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  addSkillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("3%"),
    fontSize: hp("2%"),
    color: "#333",
  },
  addSkillButton: {
    marginLeft: 10,
    backgroundColor: "#2eb872",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addSkillButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  fullSaveButton: {
    marginHorizontal: wp("5%"),
    marginTop: hp("3%"),
    borderRadius: 25,
    overflow: "hidden",
  },
  fullSaveGradient: {
    paddingVertical: hp("2%"),
    alignItems: "center",
  },
  fullSaveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: hp("2.1%"),
  },
});
