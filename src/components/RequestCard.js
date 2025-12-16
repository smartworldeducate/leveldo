import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function RequestCard({ item, isOwner, onView, onEdit, onCancel }) {
  return (
    <LinearGradient
      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.03)']}
      style={styles.card}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        {item.customerImage ? (
          <Image source={{ uri: item.customerImage }} style={styles.customerImg} />
        ) : (
          <View style={styles.customerImgPlaceholder} />
        )}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        </View>
        <View style={styles.budgetBadge}>
          <Text style={styles.budgetText}>{item.budget ? `$${item.budget}` : 'N/A'}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>

        <View style={{ flexDirection: 'row' }}>
          {!isOwner && (
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={onView}
              activeOpacity={0.8}
            >
              <Text style={styles.viewBtnText}>View Details</Text>
            </TouchableOpacity>
          )}

          {isOwner && (
            <>
              <TouchableOpacity
                style={[styles.viewBtn, { marginLeft: 8, backgroundColor: '#FFD700' }]}
                onPress={onEdit}
                activeOpacity={0.8}
              >
                <Text style={[styles.viewBtnText, { color: '#1D2671' }]}>Update</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.viewBtn, { marginLeft: 8, backgroundColor: '#FF6B6B' }]}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={[styles.viewBtnText, { color: '#fff' }]}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { padding: wp(4), borderRadius: 16, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  customerImg: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#FFD700' },
  customerImgPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.3)' },
  title: { color: '#fff', fontWeight: '700', fontSize: hp(2.2) },
  desc: { color: 'rgba(255,255,255,0.9)', fontSize: hp(1.8), marginTop: 2 },
  budgetBadge: { backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  budgetText: { fontWeight: '700', color: '#1D2671', fontSize: hp(1.7) },
  date: { color: 'rgba(255,255,255,0.7)', fontSize: hp(1.5) },
  viewBtn: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  viewBtnText: { color: '#fff', fontWeight: '700', fontSize: hp(1.7) },
});
