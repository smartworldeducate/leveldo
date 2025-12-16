import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
} from 'react-native';
import { MapPin } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONTS, RADII, SPACING, SHADOWS } from '../constants/theme';

export default function CustomerRequestCard({
  request = {},
  relationStatus = '',
  navigation,
}) {
  const {
    title = 'Service Request',
    description = 'No description available.',
    customerName = 'Customer',
    customerImage = null,
    budget = 'N/A',
    location = null,
    tags = [],
    skills = [],
    offers = [],
    attachments = [],
    createdAt = null,
  } = request;

  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      if (value.seconds) return new Date(value.seconds * 1000).toLocaleDateString();
      if (value instanceof Date) return value.toLocaleDateString();
      if (typeof value === 'string' || typeof value === 'number') return new Date(value).toLocaleDateString();
    } catch {
      return '—';
    }
    return '—';
  };

  const openLocation = () => {
    if (!location) return;
    const [lat, lng] = location.split(',');
    navigation?.navigate?.('MapViewScreen', { lat1: lat, lng1: lng });
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F3F4F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.innerCard}
        >
          {/* Top Row: Avatar + Info + Budget */}
          <View style={styles.topRow}>
            {customerImage ? (
              <Image source={{ uri: customerImage }} style={styles.avatar} />
            ) : (
              <View style={styles.fallbackAvatar}>
                <Text style={styles.fallbackLetter}>{customerName.charAt(0)}</Text>
              </View>
            )}

            <View style={styles.headerInfo}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.relation}>{relationStatus}</Text>
            </View>

            <LinearGradient
              colors={['#FFD700', '#FFC107']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.budgetBadge}
            >
              <Text style={styles.budgetText}>💲 {budget}</Text>
            </LinearGradient>
          </View>

          {/* Description */}
          <Text style={styles.description}>{description}</Text>

          {/* Meta Row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Offers</Text>
              <Text style={styles.metaValue}>{offers.length}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Attachments</Text>
              <Text style={styles.metaValue}>{attachments.length}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Posted</Text>
              <Text style={styles.metaValue}>{formatDate(createdAt)}</Text>
            </View>
          </View>

          {/* Tags */}
          {tags.length > 0 && (
            <FlatList
              data={tags}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item }) => (
                <LinearGradient
                  colors={['#D1FAE5', '#6EE7B7']}
                  style={styles.tag}
                >
                  <Text style={styles.tagText}>{item}</Text>
                </LinearGradient>
              )}
              style={{ marginVertical: 8 }}
            />
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <FlatList
              data={skills}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item }) => (
                <LinearGradient
                  colors={['#E0F2FE', '#90CDF4']}
                  style={styles.skill}
                >
                  <Text style={styles.skillText}>{item}</Text>
                </LinearGradient>
              )}
            />
          )}

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Offers ({offers.length})</Text>
            </TouchableOpacity>
            {location && (
              <TouchableOpacity style={styles.secondaryBtn} onPress={openLocation}>
                <Text style={styles.secondaryText}>View Map</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: RADII.lg,
    ...SHADOWS.card,
  },
  innerCard: {
    borderRadius: RADII.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    justifyContent: 'space-between',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: RADII.rounded,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fallbackAvatar: {
    width: 56,
    height: 56,
    borderRadius: RADII.rounded,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackLetter: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D2671',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#1D2671' },
  customerName: { fontSize: 13, color: '#4B5563', marginTop: 2 },
  relation: { fontSize: 12, color: '#16a34a', marginTop: 2 },
  budgetBadge: {
    borderRadius: RADII.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  budgetText: { fontSize: FONTS.sm, fontWeight: '700', color: '#1D2671' },
  description: { color: '#374151', fontSize: 13, lineHeight: 18, marginBottom: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metaItem: { flexDirection: 'row', justifyContent: 'space-between', width: '32%' },
  metaLabel: { fontSize: 11, color: '#9CA3AF' },
  metaValue: { fontSize: 13, fontWeight: '700', color: '#1D2671' },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: '#065F46' },
  skill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
  },
  skillText: { fontSize: 11, fontWeight: '700', color: '#0E7490' },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: SPACING.sm,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#1D2671',
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1D2671',
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  secondaryText: { color: '#1D2671', fontWeight: '700' },
});
