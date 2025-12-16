import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Clock, CheckCircle, DollarSign, Users, Paperclip } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from '../constants/theme';

export default function ProviderOwnOfferCard({
  providerOffer,
  navigation,
  request,
  currentUser,
  formatSentAt,
}) {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const getStatusColors = (status) => {
    if (status === 'accepted') {
      return {
        gradient: ['#16a34a40', '#16a34a60'],
        text: '#16a34a',
        icon: <CheckCircle size={16} color="#16a34a" />,
      };
    }
    return {
      gradient: ['#FFD70040', '#FFD70060'],
      text: '#FFD700',
      icon: <Clock size={16} color="#FFD700" />,
    };
  };

  const statusColors = getStatusColors(providerOffer.status);

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() =>
          navigation.navigate('ContractScreen', {
            loginUserId: currentUser.uid,
            otherUserId: providerOffer.providerId,
            requestId: request.id,
          })
        }
      >
        <LinearGradient
          colors={['#f9fafc', '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.innerCard}
        >
          {/* Top Row: Avatar + Info + Budget Badge */}
          <View style={styles.topRow}>
            <Image
              source={{ uri: providerOffer.providerImage || currentUser?.photo }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{providerOffer.providerName}</Text>
              <View style={styles.priceRow}>
                <DollarSign size={16} color={COLORS.primary} />
                <Text style={styles.price}>{providerOffer.offeredPrice}</Text>
              </View>
            </View>

            {/* Budget Badge */}
            <View style={styles.budgetBadge}>
              <Text style={styles.budgetText}>💲 {providerOffer.offeredPrice}</Text>
            </View>
          </View>

          {/* Message */}
          <Text style={styles.message} numberOfLines={3}>
            {providerOffer.message}
          </Text>

          {/* Meta Row: Sent At + Status */}
          <View style={styles.metaRow}>
            <View style={styles.sentAtRow}>
              <Clock size={14} color={COLORS.gray600} />
              <Text style={styles.sentAt}>{formatSentAt(providerOffer.sentAt)}</Text>
            </View>

            <LinearGradient
              colors={statusColors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statusTag}
            >
              <View style={styles.statusContent}>
                {statusColors.icon}
                <Text style={[styles.statusText, { color: statusColors.text }]}>
                  {providerOffer.status === 'pending' ? 'Pending' : 'Accepted'}
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Footer Meta */}
          <View style={styles.footerMeta}>
            <View style={styles.metaItem}>
              <Users size={16} color={COLORS.primaryDark} />
              <Text style={styles.metaText}>{providerOffer.offersCount || 0} Offers</Text>
            </View>
            <View style={styles.metaItem}>
              <Paperclip size={16} color={COLORS.accent} />
              <Text style={styles.metaText}>{providerOffer.attachments?.length || 0} Attachments</Text>
            </View>
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            {providerOffer.status === 'pending' ? (
              <View style={[styles.button, styles.pendingBtn]}>
                <Text style={[styles.buttonText, { color: COLORS.gray700 }]}>Pending</Text>
              </View>
            ) : (
              <View style={[styles.button, styles.viewBtn]}>
                <Text style={styles.buttonText}>View Contract</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    borderRadius: RADII.lg,
    ...SHADOWS.card,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  innerCard: {
    borderRadius: RADII.lg,
    padding: SPACING.md,
    backgroundColor: '#ffffff',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  avatar: { width: 60, height: 60, borderRadius: RADII.rounded, backgroundColor: COLORS.gray200, borderWidth: 1, borderColor: '#e5e7eb' },
  info: { flex: 1, marginLeft: SPACING.sm, justifyContent: 'center' },
  name: { fontSize: FONTS.md, fontWeight: '800', color: COLORS.primaryDark },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  price: { fontSize: FONTS.sm, fontWeight: '700', color: COLORS.primary, marginLeft: 4 },
  budgetBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADII.md,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  budgetText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: FONTS.sm },
  message: { fontSize: FONTS.sm, color: COLORS.gray800, lineHeight: 22, marginVertical: SPACING.xs },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: SPACING.sm },
  sentAtRow: { flexDirection: 'row', alignItems: 'center' },
  sentAt: { fontSize: FONTS.xs, color: COLORS.gray600, marginLeft: 4 },
  statusTag: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: RADII.lg, shadowColor: COLORS.gray400, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
  statusContent: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: FONTS.xs, fontWeight: '700', marginLeft: 4 },
  footerMeta: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: SPACING.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: SPACING.lg, backgroundColor: '#f3f4f6', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADII.md },
  metaText: { fontSize: FONTS.xs, color: COLORS.gray700, marginLeft: 4 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.sm },
  button: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: RADII.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  pendingBtn: { backgroundColor: COLORS.grayLight },
  viewBtn: { backgroundColor: COLORS.primary },
  buttonText: { fontSize: FONTS.sm, fontWeight: '700', color: COLORS.white },
});
