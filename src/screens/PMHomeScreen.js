// UsersScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Header from '../components/Header';

const PMScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  // ==========================
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const snapshot = await firestore().collection('users').get();
      const usersArray = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersArray);
      setLoading(false);
    } catch (err) {
      console.log('Error loading users:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ==========================
  const deleteUser = (userId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('users').doc(userId).delete();
              Alert.alert('Deleted', 'User has been deleted successfully');
              loadUsers();
            } catch (err) {
              console.log('Delete error:', err);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  // ==========================
  if (loading) {
    return (
      <LinearGradient colors={['#1D2671', '#C33764']} style={styles.loading}>
        <ActivityIndicator size="large" color="#FFD700" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1D2671', '#C33764']} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
     <View style={{ marginTop: hp(6), marginHorizontal: hp(1.5) }}>
        <Header navigation={navigation} title="All Users" />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <LinearGradient colors={['#ffffff15', '#ffffff05']} style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name || 'No Name'}</Text>
                <Text style={styles.email}>{item.email || 'No Email'}</Text>
                <Text style={styles.role}>Role: {item.role || 'N/A'}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteUser(item.id)}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}
        ListEmptyComponent={<Text style={styles.noUserText}>No Users Found</Text>}
      />
    </LinearGradient>
  );
};

// ======================
// Styles
// ======================
const styles = StyleSheet.create({
  container: { flex: 1 },

  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
    textAlign: 'center',
    marginTop: hp('5%'),
    marginBottom: 20,
  },

  card: {
    padding: 16,
    borderRadius: 18,
    marginHorizontal: wp('5%'),
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  row: { flexDirection: 'row', alignItems: 'center' },

  name: { fontSize: 16, fontWeight: '700', color: '#fff' },
  email: { fontSize: 14, color: '#eee', marginTop: 2 },
  role: { fontSize: 13, color: '#FFD700', marginTop: 4 },

  deleteBtn: {
    backgroundColor: '#FF4C4C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  deleteBtnText: { color: '#fff', fontWeight: '700' },

  noUserText: { color: '#fff', fontSize: 18, textAlign: 'center', marginTop: 100 },

  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default PMScreen;
