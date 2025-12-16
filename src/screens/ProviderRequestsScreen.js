// ============================================
// ProviderRequestsScreen.js (Green + Black + Navy Theme)
// ============================================
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapPin, DollarSign, Users, Calendar } from "lucide-react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Header from '../components/Header';
import { COLORS, RADII, SPACING, FONTS, SHADOWS } from '../constants/theme';

export default function ProviderRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editBudget, setEditBudget] = useState('');

  useEffect(() => {
    const loadUserAndRequests = async () => {
      try {
        const u = await AsyncStorage.getItem("user");
        if (!u) {
          setLoading(false);
          return;
        }
        const user = JSON.parse(u);
        setCurrentUser(user);

        let query = firestore()
          .collection("serviceRequests")
          .orderBy("createdAt", "desc")
          .where("status", "==", "open");

        if ((user.role || "").toLowerCase() === "customer") {
          query = query.where("customerId", "==", user.uid);
        }

        const unsub = query.onSnapshot(
          snap => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setRequests(list);
            setLoading(false);
          },
          err => { console.log(err); setLoading(false); }
        );

        return () => unsub();
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    loadUserAndRequests();
  }, []);

  const handleCancel = async (requestId) => {
    Alert.alert(
      "Cancel Request",
      "Are you sure?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await firestore().collection("serviceRequests").doc(requestId).update({ status: "cancelled" });
              Alert.alert("Success", "Request cancelled.");
            } catch (err) {
              Alert.alert("Error", "Failed to cancel request.");
            }
          },
        },
      ]
    );
  };

  const handleEdit = (item) => {
    setEditingRequest(item);
    setEditTitle(item.title);
    setEditDesc(item.description);
    setEditBudget(item.budget?.toString() || "");
    setModalVisible(true);
  };

  const saveEdit = async () => {
    if (!editTitle.trim()) return Alert.alert("Validation", "Title required");

    try {
      await firestore()
        .collection("serviceRequests")
        .doc(editingRequest.id)
        .update({
          title: editTitle,
          description: editDesc,
          budget: Number(editBudget) || 0,
        });

      setModalVisible(false);
      Alert.alert("Success", "Updated successfully");
    } catch (err) {
      Alert.alert("Error", "Failed to update");
    }
  };

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      if (value.seconds) return new Date(value.seconds * 1000).toLocaleDateString();
      if (value instanceof Date) return value.toLocaleDateString();
      return new Date(value).toLocaleDateString();
    } catch {
      return '—';
    }
  };

  const renderRequest = (item) => {
    const isOwner = currentUser?.uid === item.customerId;
    const location = item.location || item.customerLocation || item.providerLocation || null;

    return (
      <View style={[styles.card]}>
        {/* Top Row */}
        <View style={styles.topRow}>
          {item.customerImage ? (
            <Image source={{ uri: item.customerImage }} style={styles.avatar} />
          ) : (
            <View style={styles.fallbackAvatar}>
              <Text style={styles.fallbackLetter}>{(item.customerName || 'C').charAt(0)}</Text>
            </View>
          )}

          <View style={styles.headerInfo}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.customerName}>{item.customerName || 'Customer'}</Text>
          </View>

          {location && (
            <TouchableOpacity style={styles.locationBtn} onPress={() => navigation.navigate("MapViewScreen", { url: `https://www.google.com/maps?q=${location}` })}>
              <MapPin size={18} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        <Text style={styles.description}>{item.description}</Text>

        {/* Meta Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <DollarSign size={16} color={COLORS.primary} />
            <Text style={styles.metaValue}> {item.budget || 'N/A'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={16} color={COLORS.primaryDark} />
            <Text style={styles.metaValue}> {item.offers?.length || 0} Offers</Text>
          </View>
          <View style={styles.metaItem}>
            <Calendar size={16} color={COLORS.gray800} />
            <Text style={styles.metaValue}> {formatDate(item.createdAt)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          {!isOwner && (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate("RequestDetails", { requestId: item.id })}>
              <Text style={styles.primaryText}>View Details</Text>
            </TouchableOpacity>
          )}
          {isOwner && (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => handleEdit(item)}>
                <Text style={styles.primaryText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: COLORS.black }]} onPress={() => handleCancel(item.id)}>
                <Text style={[styles.secondaryText, { color: COLORS.white }]}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff'}}>
      {/* <View style={{ marginTop: hp(6), marginHorizontal: wp(3) }}>
        <Header title="Available Requests" navigation={navigation} />
      </View> */}

      <FlatList
        contentContainerStyle={{ paddingVertical: SPACING.md }}
        data={requests}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => renderRequest(item)}
        ListEmptyComponent={<Text style={styles.emptyText}>No requests found</Text>}
      />

      {/* Edit Modal */}
     <Modal visible={modalVisible} transparent animationType="fade">
  <View style={styles.modalBackground}>
    <View style={[styles.modalContainer, { backgroundColor: '#fff' }]}>
      <Text style={styles.modalTitle}>Update Request</Text>

      <TextInput
        value={editTitle}
        onChangeText={setEditTitle}
        placeholder="Title"
        placeholderTextColor="#888" // dark gray placeholder
        style={[styles.modalInput, { color: '#000' }]} // black text
      />

      <TextInput
        value={editDesc}
        onChangeText={setEditDesc}
        multiline
        placeholder="Description"
        placeholderTextColor="#888" // dark gray placeholder
        style={[styles.modalInput, { height: 100, color: '#000' }]} // black text
      />

      <TextInput
        value={editBudget}
        onChangeText={setEditBudget}
        keyboardType="numeric"
        placeholder="Budget"
        placeholderTextColor="#888" // dark gray placeholder
        style={[styles.modalInput, { color: '#000' }]} // black text
      />

      <View style={styles.modalBtnRow}>
        <TouchableOpacity
          style={[styles.modalBtn, { backgroundColor: COLORS.black }]}
          onPress={() => setModalVisible(false)}
        >
          <Text style={{ color: COLORS.white, fontWeight: '700' }}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
          onPress={saveEdit}
        >
          <Text style={{ color: COLORS.white, fontWeight: '700' }}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </View>
  );
}

// ===========================
// STYLES
// ===========================
const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  card: {
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    backgroundColor:'#ffffff',
    ...SHADOWS.card,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  avatar: { width: 56, height: 56, borderRadius: RADII.rounded },
  fallbackAvatar: { width: 56, height: 56, borderRadius: RADII.rounded, backgroundColor: COLORS.black, justifyContent: 'center', alignItems: 'center' },
  fallbackLetter: { fontSize: FONTS.lg, fontWeight: '800', color: COLORS.primary },
  headerInfo: { flex: 1, marginLeft: SPACING.sm },
  title: { fontSize: FONTS.md, fontWeight: '700', color: COLORS.primary },
  customerName: { fontSize: FONTS.sm, color: COLORS.primaryDark, marginTop: 2 },
  locationBtn: { padding: 6, borderRadius: RADII.sm, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  description: { color: COLORS.white, fontSize: FONTS.sm, lineHeight: 18, marginBottom: SPACING.sm },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaValue: { fontSize: FONTS.sm, fontWeight: '600', color: COLORS.primary, marginLeft: 4 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm },
  primaryBtn: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, borderRadius: RADII.md, marginRight: SPACING.sm, alignItems: 'center' },
  primaryText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sm },
  secondaryBtn: { flex: 1, backgroundColor: COLORS.black, borderRadius: RADII.md, marginLeft: SPACING.sm, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.sm },
  secondaryText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sm },
  emptyText: { color: COLORS.gray500, textAlign: 'center', marginTop: hp(10) },

modalBackground: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.3)', // semi-transparent
},
modalContainer: {
  width: wp(90),
  padding: 20,
  borderRadius: RADII.md,
  backgroundColor: '#fff',
},
modalTitle: { color: '#000', fontSize: FONTS.xl, fontWeight: '700', marginBottom: 14 },
modalInput: {
  backgroundColor: '#f9f9f9', // light input background
  padding: 12,
  borderRadius: RADII.md,
  marginTop: 10,
  color: '#000', // text color black
},
modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
modalBtn: { flex: 1, paddingVertical: 12, borderRadius: RADII.md, alignItems: 'center', marginHorizontal: 4 },

});
