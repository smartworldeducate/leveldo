import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import LinearGradient from 'react-native-linear-gradient';
import { CreditCard, CreditCardCheck, CreditCardFront, CreditCardOff, Wallet } from 'lucide-react-native';

const PaymentScreen = () => {
  const [webviewVisible, setWebviewVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const paypalUrl = 'https://paypal.me/leveldodot';
  const cardUrl = 'https://www.mastercard.com'; // Placeholder for card payment

  const handlePaymentSelect = (method) => {
    setSelectedMethod(method);
    setWebviewVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Text style={styles.title}>Select Payment Method</Text>

      {/* PayPal Card */}
      <TouchableOpacity
        style={styles.cardOuter}
        activeOpacity={0.8}
        onPress={() => handlePaymentSelect('paypal')}
      >
        <LinearGradient colors={['#ffffff', '#f4f7fb']} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Wallet size={36} color="#2eb872" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>PayPal</Text>
              <Text style={styles.cardInfo}>
                Fast & secure checkout with your PayPal account or linked cards.
              </Text>
              <Text style={styles.bullet}>• Secure transactions</Text>
              <Text style={styles.bullet}>• Instant processing</Text>
              <Text style={styles.bullet}>• Accepted worldwide</Text>
              <Text style={styles.feeInfo}>*Standard PayPal transaction fees may apply.</Text>
              <Text style={styles.cta}>Tap to continue →</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Credit/Debit Card */}
      <TouchableOpacity
        style={styles.cardOuter}
        activeOpacity={0.8}
        onPress={() => handlePaymentSelect('card')}
      >
        <LinearGradient colors={['#ffffff', '#f4f7fb']} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <CreditCard size={36} color="#2eb872" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Credit / Debit Card</Text>
              <Text style={styles.cardInfo}>
                Pay using Visa, MasterCard or any supported card.
              </Text>
              <Text style={styles.bullet}>• Encrypted & secure</Text>
              <Text style={styles.bullet}>• No PayPal required</Text>
              <Text style={styles.bullet}>• Global support</Text>
              <Text style={styles.feeInfo}>*Bank or provider fees may apply.</Text>
              <Text style={styles.cta}>Tap to continue →</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* WebView Modal */}
      <Modal
        visible={webviewVisible}
        onRequestClose={() => setWebviewVisible(false)}
      >
        <View style={styles.webviewContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.headerTitle}>
              {selectedMethod === 'paypal' ? 'PayPal Payment' : 'Card Payment'}
            </Text>
            <TouchableOpacity onPress={() => setWebviewVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#2eb872" />
            </View>
          )}

          <WebView
            source={{ uri: selectedMethod === 'paypal' ? paypalUrl : cardUrl }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            style={{ flex: 1 }}
            scrollEnabled
            bounces={false}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 22 },
  title: { fontSize: 26, fontWeight: '700', color: '#0a1f44', alignSelf: 'center', marginBottom: 25 },
  cardOuter: { marginBottom: 18 },
  card: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e6ecf3',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  row: { flexDirection: 'row' },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e6f5ef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardTitle: { fontSize: 20, color: '#0a1f44', fontWeight: '700', marginBottom: 6 },
  cardInfo: { color: '#475569', fontSize: 14, marginBottom: 6 },
  bullet: { fontSize: 14, color: '#64748b', marginBottom: 2 },
  feeInfo: { color: '#94a3b8', fontSize: 12, marginTop: 6, marginBottom: 10 },
  cta: { color: '#2eb872', fontSize: 14, fontWeight: '600', marginTop: 10 },
  webviewContainer: { flex: 1, backgroundColor: '#ffffff' },
  modalHeader: {
    height: 55,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerTitle: { fontSize: 18, color: '#0f172a', fontWeight: '600' },
  closeText: { color: '#ef4444', fontSize: 15 },
  loader: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    zIndex: 10,
  },
});

export default PaymentScreen;
