import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  CreditCard,
  DollarSign,
  PlusCircle,
  MapPin,
  Calendar,
  ArrowLeft,
} from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Header from '../components/Header';

const PaymentScreen = ({ navigation, route }) => {
  const contract = route?.params?.contract || {
    customer: 'John Carter',
    service: 'Plumbing Service',
    location: 'Los Angeles, CA',
    startDate: '2025-11-01',
    endDate: '2025-11-05',
    amount: 120,
    tax: 10,
    discount: 5,
  };

  const totalAmount = contract.amount + contract.tax - contract.discount;

  const paymentMethods = [
    { name: 'Credit Card', icon: <CreditCard size={22} color="#fff" /> },
    { name: 'Cash', icon: <DollarSign size={22} color="#fff" /> },
    { name: 'Other', icon: <PlusCircle size={22} color="#fff" /> },
  ];

  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].name);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  return (
    <LinearGradient colors={['#C33764', '#1D2671']} style={styles.container}>
      
      {/* Header with Back Button */}
       <View style={{ marginTop: hp(6), marginHorizontal: hp(1.5) }}>
            <Header navigation={navigation} title="Payment" />
          </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp('12%') }}>

        {/* Contract Details */}
        <Text style={styles.screenTitle}>Contract Details</Text>
        <View style={styles.contractCard}>
          <View style={styles.row}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/100?img=12' }}
              style={styles.avatar}
            />
            <View style={{ marginLeft: wp('3%') }}>
              <Text style={styles.customerName}>{contract.customer}</Text>
              <Text style={styles.serviceName}>{contract.service}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Calendar size={18} color="#FFD700" />
            <Text style={styles.detailText}>Start: {contract.startDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Calendar size={18} color="#FFD700" />
            <Text style={styles.detailText}>End: {contract.endDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={18} color="#FFD700" />
            <Text style={styles.detailText}>Location: {contract.location}</Text>
          </View>

          {/* Amount Breakdown */}
          <View style={styles.amountSection}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Amount:</Text>
              <Text style={styles.amountValue}>${contract.amount}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Tax:</Text>
              <Text style={styles.amountValue}>${contract.tax}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Discount:</Text>
              <Text style={styles.amountValue}>-${contract.discount}</Text>
            </View>
            <View style={[styles.amountRow, { marginTop: hp('1%') }]}>
              <Text style={[styles.amountLabel, { fontWeight: '700', fontSize: hp('2%') }]}>Total:</Text>
              <Text style={[styles.amountValue, { fontWeight: '700', fontSize: hp('2%'), color: '#FFD700' }]}>${totalAmount}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        <View style={styles.paymentMethods}>
          {paymentMethods.map((method, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.methodCard,
                selectedMethod === method.name && { borderColor: '#FFD700', borderWidth: 2 },
              ]}
              onPress={() => setSelectedMethod(method.name)}
              activeOpacity={0.85}
            >
              {method.icon}
              <Text style={styles.methodName}>{method.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Credit Card Input */}
        {selectedMethod === 'Credit Card' && (
          <View style={styles.cardInputSection}>
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              placeholderTextColor="rgba(255,255,255,0.7)"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={setCardNumber}
            />
            <View style={styles.cardRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: wp('2%') }]}
                placeholder="Expiry (MM/YY)"
                placeholderTextColor="rgba(255,255,255,0.7)"
                keyboardType="numeric"
                value={expiry}
                onChangeText={setExpiry}
              />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: wp('2%') }]}
                placeholder="CVV"
                placeholderTextColor="rgba(255,255,255,0.7)"
                keyboardType="numeric"
                secureTextEntry
                value={cvv}
                onChangeText={setCvv}
              />
            </View>
          </View>
        )}

        {/* Pay Now Button */}
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => alert(`Paid $${totalAmount} using ${selectedMethod}`)}
        >
          <LinearGradient
            colors={['#1D2671', '#C33764']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.payButtonGradient}>
            <Text style={styles.payButtonText}>Pay Now</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  backButton: { padding: wp('2%') },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: hp('2.3%'), fontWeight: '700', color: '#fff' },

  /* Titles */
  screenTitle: { fontSize: hp('2.5%'), fontWeight: '700', color: '#fff', marginVertical: hp('2%'), marginLeft: wp('4%') },
  sectionTitle: { fontSize: hp('2%'), fontWeight: '700', color: '#fff', marginBottom: hp('2%'), marginLeft: wp('4%') },

  /* Contract Card */
  contractCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: wp('4%'), marginHorizontal: wp('4%'), marginBottom: hp('3%') },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: hp('2%') },
  avatar: { width: wp('12%'), height: wp('12%'), borderRadius: wp('6%'), borderWidth: 1, borderColor: '#FFD700' },
  customerName: { fontSize: hp('2%'), color: '#FFD700', fontWeight: '700' },
  serviceName: { fontSize: hp('1.8%'), color: '#fff' },

  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: hp('1%') },
  detailText: { marginLeft: wp('2%'), color: '#fff', fontSize: hp('1.7%') },

  amountSection: {},
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: hp('0.5%') },
  amountLabel: { fontSize: hp('1.7%'), color: 'rgba(255,255,255,0.8)' },
  amountValue: { fontSize: hp('1.7%'), color: '#fff', fontWeight: '600' },

  /* Payment Methods */
  paymentMethods: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: wp('4%'), marginBottom: hp('4%') },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: wp('3%'),
    borderRadius: 15,
    width: wp('28%'),
    justifyContent: 'center',
  },
  methodName: { color: '#fff', fontWeight: '600', marginLeft: wp('2%') },

  /* Credit Card Input */
  cardInputSection: { marginBottom: hp('3%'), marginHorizontal: wp('4%') },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.2%'),
    color: '#fff',
    fontSize: hp('1.8%'),
    marginBottom: hp('2%'),
  },
  cardRow: { flexDirection: 'row' },

  /* Pay Button */
  payButton: { marginTop: hp('2%'), marginHorizontal: wp('4%') },
  payButtonGradient: { paddingVertical: hp('1.8%'), borderRadius: 15, alignItems: 'center' },
  payButtonText: { color: '#fff', fontSize: hp('2%'), fontWeight: '700' },
});

export default PaymentScreen;
