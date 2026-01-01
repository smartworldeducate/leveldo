import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Trash2 } from 'lucide-react-native';

const COLORS = {
  background: '#F4F6FB',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  pendingBg: '#FEF3C7',
  approvedBg: '#DCFCE7',
  pendingText: '#92400E',
  approvedText: '#065F46',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
};

export default function PMHomescreen() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const snap = await firestore().collection('serviceRequests').get();
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setRequests(data);
      setLoading(false);
    } catch (err) {
      console.log('Error loading requests:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const deleteRequest = id => {
    Alert.alert(
      'Delete Request',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await firestore()
              .collection('serviceRequests')
              .doc(id)
              .delete();

            setRequests(prev => prev.filter(r => r.id !== id));
          },
        },
      ]
    );
  };

  const renderCard = ({ item }) => {
    const isPending = (item.status || '').toLowerCase() === 'open';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
      >
        {/* Avatar */}
        <Image
          source={{ uri: item.customerImage || 'https://i.pravatar.cc/150' }}
          style={styles.avatar}
        />

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title || 'Untitled Request'}
            </Text>

            <View
              style={[
                styles.statusPill,
                isPending ? styles.pendingPill : styles.approvedPill,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isPending ? styles.pendingText : styles.approvedText,
                ]}
              >
                {isPending ? 'OPEN' : 'APPROVED'}
              </Text>
            </View>
          </View>

          <Text style={styles.name}>
            {item.customerName || 'Unknown Customer'}
          </Text>

          <Text style={styles.meta}>
            {item.category || 'N/A'} • ₹{item.budget || 0}
          </Text>

          {item.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>

        {/* Action */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteRequest(item.id)}
        >
          <Trash2 size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.text} />
        <Text style={styles.loadingText}>Loading requests…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        contentContainerStyle={{
          paddingBottom: 28,
          paddingTop: 4,
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.noData}>
            <Text style={styles.noDataText}>
              No service requests available
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.muted,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 18,
    marginHorizontal: 16,
    borderRadius: 18,
    alignItems: 'flex-start',

    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 10 },
    // shadowOpacity: 0.08,
    // shadowRadius: 14,
    // elevation: 5,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    backgroundColor: '#E5E7EB',
  },

  content: {
    flex: 1,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },

  name: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.muted,
    marginTop: 6,
  },

  meta: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },

  description: {
    fontSize: 13,
    lineHeight: 18,
    color: '#374151',
    marginTop: 8,
  },

  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },

  pendingPill: {
    backgroundColor: COLORS.pendingBg,
  },

  approvedPill: {
    backgroundColor: COLORS.approvedBg,
  },

  pendingText: {
    color: COLORS.pendingText,
  },

  approvedText: {
    color: COLORS.approvedText,
  },

  deleteButton: {
    marginLeft: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: COLORS.dangerBg,
    alignSelf: 'flex-start',
  },

  separator: {
    height: 14,
  },

  noData: {
    marginTop: 80,
    alignItems: 'center',
  },

  noDataText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.muted,
  },
});
