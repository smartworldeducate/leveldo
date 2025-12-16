import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Image, Alert, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft, FileText, Calendar, Clock, DollarSign, User, ShieldCheck, CheckCircle2, Loader, Handshake
} from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import firestore from '@react-native-firebase/firestore';

export default function ContractScreen({ navigation, route }) {
  const { loginUserId, otherUserId, requestId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [loginUser, setLoginUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    let unsubRequest;
    const init = async () => {
      try {
        const userDoc = await firestore().collection('users').doc(loginUserId).get();
        const otherDoc = await firestore().collection('users').doc(otherUserId).get();
        setLoginUser(userDoc.exists ? userDoc.data() : null);
        setOtherUser(otherDoc.exists ? otherDoc.data() : null);

        unsubRequest = firestore().collection('serviceRequests').doc(requestId)
          .onSnapshot(doc => {
            const data = doc.data();
            setRequest({ id: doc.id, ...data });
            setLoading(false);
          });
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    init();
    return () => unsubRequest && unsubRequest();
  }, [loginUserId, otherUserId, requestId]);

  const signContract = async () => {
    try {
      const isCustomer = request?.customerId === loginUserId;
      const update = isCustomer
        ? { signedByCustomer: true, customerSignedAt: new Date().toISOString() }
        : { signedByProvider: true, providerSignedAt: new Date().toISOString() };
      await firestore().collection('serviceRequests').doc(requestId).update(update);
      Alert.alert('Signed', 'Signature saved.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save signature.');
    }
  };

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator color="#1D2671" size="large" />
    </View>
  );

  const sender = request?.customerId === loginUserId ? loginUser : (request?.customerId ? { name: request.customerName, avatar: request.customerImage } : loginUser);
  const receiver = request?.acceptedProviderId === otherUserId ? otherUser : otherUser;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(4) }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color="#1D2671" size={26} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Contract</Text>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.contractId}>Contract #{request?.id}</Text>
          <Text style={styles.contractDate}>Created: {new Date(request?.createdAt).toLocaleDateString()}</Text>
          <View style={styles.statusBadge}>
            <ShieldCheck color="#fff" size={16} />
            <Text style={styles.statusText}>{(request?.status || '').toUpperCase()}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.partiesCard}>
          <View style={styles.party}>
            <Image source={{ uri: request?.customerImage || (loginUser?.photo || '') }} style={styles.avatar} />
            <Text style={styles.partyName}>{request?.customerName || loginUser?.name}</Text>
            <Text style={styles.role}>Customer</Text>
          </View>

          <Handshake size={40} color="#1D2671" style={styles.vsIcon} />

          <View style={styles.party}>
            <Image source={{ uri: otherUser?.photo || request?.providerImage || '' }} style={styles.avatar} />
            <Text style={styles.partyName}>{otherUser?.name || 'Provider'}</Text>
            <Text style={styles.role}>Service Provider</Text>
          </View>
        </View>

        {/* Contract Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contract Details</Text>
          <Detail icon={<FileText color="#1D2671" size={20} />} text={`Service: ${request?.title || ''}`} />
          <Detail icon={<Calendar color="#1D2671" size={20} />} text={`Date: ${request?.serviceDate || request?.createdAt || ''}`} />
          <Detail icon={<Clock color="#1D2671" size={20} />} text={`Duration: ${request?.duration || ''}`} />
          <Detail icon={<DollarSign color="#1D2671" size={20} />} text={`Rate: ${request?.rate || request?.offeredPrice || ''}`} />
          <Detail icon={<User color="#1D2671" size={20} />} text={`Total: ${request?.total || ''}`} />
        </View>

        {/* Agreement Terms */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Agreement Terms</Text>
          <Text style={styles.termsText}>
            1. The service provider commits to completing the task with professionalism and care.{"\n\n"}
            2. The customer agrees to make payment immediately upon completion.{"\n\n"}
            3. Cancellation must be made at least 12 hours before service time.{"\n\n"}
            4. Both parties acknowledge mutual understanding and trust under this contract.
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Customer Signature</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{request?.signedByCustomer ? (request.customerName || loginUser?.name) : 'Not signed'}</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Provider Signature</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{request?.signedByProvider ? (otherUser?.name || 'Provider') : 'Not signed'}</Text>
          </View>
        </View>

        {/* Sign Button */}
        <TouchableOpacity onPress={signContract} style={styles.button}>
          <LinearGradient colors={['#2eb872', '#16a34a']} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Sign Contract</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

/* Subcomponents */
const Detail = ({ icon, text }) => (
  <View style={styles.detailRow}>
    {icon}
    <Text style={styles.detailText}>{text}</Text>
  </View>
);

/* Styles — redesigned for professional white/light theme */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(3),
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  headerTitle: { fontSize: hp(2.6), fontWeight: '700', marginLeft: 10, color: '#1D2671' },

  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: wp(5),
    borderRadius: 16,
    padding: wp(4),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  contractId: { color: '#1D2671', fontWeight: '700', fontSize: hp(2) },
  contractDate: { color: '#555', marginTop: 5 },
  statusBadge: {
    backgroundColor: '#2eb872',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 10,
  },
  statusText: { color: '#fff', fontWeight: '600', marginLeft: 6 },

  partiesCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: wp(5),
    marginTop: hp(2.5),
    paddingVertical: hp(2),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  party: { alignItems: 'center' },
  avatar: { width: wp(18), height: wp(18), borderRadius: wp(9) },
  partyName: { color: '#1D2671', fontWeight: '700', marginTop: 8, fontSize: hp(1.9) },
  role: { color: '#777', fontSize: hp(1.5) },
  vsIcon: { marginHorizontal: 15, padding: 12, borderRadius: 50 },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: wp(5),
    borderRadius: 16,
    padding: wp(4),
    marginTop: hp(2.5),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: hp(2.2), fontWeight: '700', color: '#1D2671', marginBottom: hp(1.5) },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(1.5) },
  detailText: { marginLeft: 10, color: '#555', fontSize: hp(1.9), fontWeight: '500' },

  termsText: { color: '#555', fontSize: hp(1.8), lineHeight: hp(2.8), marginTop: 5 },

  signatureSection: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: wp(5), marginTop: hp(3) },
  signatureBox: { width: '47%', backgroundColor: '#f2f2f2', borderRadius: 12, padding: wp(3), alignItems: 'center' },
  signatureLabel: { color: '#555', fontSize: hp(1.7) },
  signatureLine: { borderBottomWidth: 1, borderBottomColor: '#1D2671', width: '80%', marginVertical: hp(1.5) },
  signatureName: { color: '#1D2671', fontWeight: '600' },

  button: { marginHorizontal: wp(5), marginTop: hp(4), borderRadius: 30, overflow: 'hidden' },
  buttonGradient: { paddingVertical: hp(2), alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: hp(2.1), fontWeight: '700', textTransform: 'uppercase' },
});
