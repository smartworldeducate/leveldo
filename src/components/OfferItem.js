// components/OfferItem.js
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { MapPin } from 'lucide-react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS, FONTS, RADII, SPACING, SHADOWS } from '../constants/theme';

const OfferItem = ({
  offer,
  request,
  navigation,
  currentUser,
  acceptOffer,
  formatSentAt,
  onExpire,
}) => {
  const [remaining, setRemaining] = React.useState(
    offer.expiresAt ? offer.expiresAt - Date.now() : 0
  );

  const progressAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (!offer.expiresAt || offer.status !== 'pending') return;

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: remaining,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      const newRemaining = offer.expiresAt - Date.now();
      setRemaining(newRemaining);

      if (newRemaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire(offer.id);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [offer.expiresAt, offer.status, onExpire]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getStatusStyle = () => {
    if (offer.status === 'accepted') {
      return { backgroundColor: '#e0f8ec', textColor: '#16a34a' };
    }
    if (offer.status === 'pending') {
      return { backgroundColor: '#fff7e0', textColor: '#FFD700' };
    }
    return { backgroundColor: '#f0f0f0', textColor: '#999' };
  };

  const statusStyle = getStatusStyle();

  return (
    <View style={styles.card}>
      {/* Top Row: Avatar + Info */}
      <View style={styles.row}>
        <Image source={{ uri: offer.providerImage }} style={styles.providerImg} />
        <View style={{ flex: 1, marginLeft: SPACING.sm }}>
          <Text style={styles.providerName}>{offer.providerName}</Text>
          <Text style={styles.price}>💲 {offer.offeredPrice}</Text>
          <Text style={styles.message} numberOfLines={2}>{offer.message}</Text>

          {offer.providerLocation && (
            <TouchableOpacity
              style={styles.locationRow}
              onPress={() => {
                const [lat, lng] = offer.providerLocation.split(',');
                const [lat2, lng2] = request.location.split(',');
                navigation.navigate('MapViewScreen', { lat1: lat, lng1: lng,lat2:lat2,lng2:lng2 });
              }}
            >
              <MapPin size={14} color={COLORS.accent} />
              <Text style={styles.locationText}>Provider Location</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Countdown + Progress */}
      {offer.status === 'pending' && offer.expiresAt && (
        <View style={{ marginTop: SPACING.sm }}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
          <Text style={styles.countdownText}>
            Expires in {Math.max(0, Math.ceil(remaining / 1000))}s
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footerRow}>
        <Text style={styles.sentAt}>{formatSentAt(offer.sentAt)}</Text>

        {offer.status === 'pending' && (
          <TouchableOpacity
            onPress={() => acceptOffer(request.id, offer)}
            style={[styles.statusBtn, { backgroundColor: statusStyle.backgroundColor }]}
          >
            <Text style={[styles.statusText, { color: statusStyle.textColor }]}>Accept</Text>
          </TouchableOpacity>
        )}

        {offer.status === 'accepted' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('ContractScreen', {
              loginUserId: currentUser.uid,
              otherUserId: offer.providerId,
              requestId: request.id,
            })}
            style={[styles.statusBtn, { backgroundColor: statusStyle.backgroundColor }]}
          >
            <Text style={[styles.statusText, { color: statusStyle.textColor }]}>View Contract</Text>
          </TouchableOpacity>
        )}
          {offer.status === 'accepted' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('ChatScreen', {
              loginUserId: currentUser.uid,
              otherUserId: offer.providerId,
              chatId: request.id,
            })}
            style={[styles.statusBtn, { backgroundColor: statusStyle.backgroundColor }]}
          >
            <Text style={[styles.statusText, { color: statusStyle.textColor }]}>Message</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    ...SHADOWS.card,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  providerImg: { width: 50, height: 50, borderRadius: RADII.rounded },
  providerName: { fontSize: FONTS.md, fontWeight: '700', color: COLORS.primaryDark },
  price: { fontSize: FONTS.sm, color: COLORS.secondaryDark, marginTop: 2 },
  message: { fontSize: FONTS.sm, color: COLORS.gray600, marginTop: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  locationText: { color: COLORS.accent, marginLeft: 6, fontSize: FONTS.xs },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: { height: '100%', backgroundColor: COLORS.accent },
  countdownText: { fontSize: FONTS.xs, color: COLORS.gray600 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm },
  sentAt: { fontSize: FONTS.xs, color: COLORS.gray500 },
  statusBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: { fontWeight: '700', fontSize: FONTS.sm },
});

export default OfferItem;
