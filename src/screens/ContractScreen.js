import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  DollarSign,
  User,
  ShieldCheck,
  CheckCircle2,
  Loader,
  Handshake,
} from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function ContractScreen({ navigation }) {
  return (
    <LinearGradient
      colors={['#C33764', '#1D2671']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}>
      
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft color="#fff" size={26} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Service Contract</Text>
          </View>

          {/* Contract Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.contractId}>Contract #SP2025-0912</Text>
            <Text style={styles.contractDate}>Created: Nov 11, 2025</Text>
            <View style={styles.statusBadge}>
              <ShieldCheck color="#fff" size={16} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>

          {/* Parties */}
          <View style={styles.partiesCard}>
            <View style={styles.party}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=3' }} style={styles.avatar} />
              <Text style={styles.partyName}>Robby G.</Text>
              <Text style={styles.role}>Customer</Text>
            </View>

            {/* Beautiful handshake icon */}
            <Handshake size={40} color="#FFA500" style={styles.vsIcon} />

            <View style={styles.party}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
              <Text style={styles.partyName}>John Carter</Text>
              <Text style={styles.role}>Service Provider</Text>
            </View>
          </View>

          {/* Contract Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contract Details</Text>
            <Detail icon={<FileText color="#C33764" size={20} />} text="Service: Leak Repair" />
            <Detail icon={<Calendar color="#C33764" size={20} />} text="Date: Nov 15, 2025" />
            <Detail icon={<Clock color="#C33764" size={20} />} text="Duration: 3 Hours" />
            <Detail icon={<DollarSign color="#C33764" size={20} />} text="Rate: $40/hr" />
            <Detail icon={<User color="#C33764" size={20} />} text="Total: $120" />
          </View>

          {/* Progress Timeline */}
          <View style={styles.timelineCard}>
            <Text style={styles.cardTitle}>Progress</Text>
            <View style={styles.timelineRow}>
              <View style={styles.timelineItem}>
                <CheckCircle2 color="#FFD700" size={26} />
                <Text style={styles.timelineText}>Requested</Text>
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineItem}>
                <Loader color="#FFD700" size={26} />
                <Text style={styles.timelineText}>In Progress</Text>
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineItem}>
                <CheckCircle2 color="rgba(255,255,255,0.5)" size={26} />
                <Text style={[styles.timelineText, { opacity: 0.6 }]}>Completed</Text>
              </View>
            </View>
          </View>

          {/* Terms & Conditions */}
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
            <SignatureBox name="Robby G." role="Customer" />
            <SignatureBox name="John Carter" role="Provider" />
          </View>

          {/* Confirm Button */}
          <TouchableOpacity style={styles.button}>
            <LinearGradient
              colors={['#1D2671', '#C33764']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Confirm & Sign Contract</Text>
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ----- Sub Components ----- */
const Detail = ({ icon, text }) => (
  <View style={styles.detailRow}>
    {icon}
    <Text style={styles.detailText}>{text}</Text>
  </View>
);

const SignatureBox = ({ name, role }) => (
  <View style={styles.signatureBox}>
    <Text style={styles.signatureLabel}>{role} Signature</Text>
    <View style={styles.signatureLine} />
    <Text style={styles.signatureName}>{name}</Text>
  </View>
);

/* ----- Styles ----- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(6),
    paddingHorizontal: wp(5),
  },
  headerTitle: {
    color: '#fff',
    fontSize: hp(2.6),
    fontWeight: '700',
    marginLeft: 10,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: wp(5),
    marginTop: hp(2.5),
    borderRadius: 20,
    padding: wp(4),
  },
  contractId: { color: '#FFD700', fontWeight: '700', fontSize: hp(2) },
  contractDate: { color: '#fff', opacity: 0.7, marginTop: 5 },
  statusBadge: {
    backgroundColor: '#1D2671',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    marginHorizontal: wp(5),
    marginTop: hp(2.5),
    paddingVertical: hp(2),
  },
  party: { alignItems: 'center' },
  avatar: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    borderWidth: 2,
    borderColor: '#fff',
  },
  partyName: { color: '#fff', fontWeight: '700', marginTop: 8, fontSize: hp(1.9) },
  role: { color: 'rgba(255,255,255,0.8)', fontSize: hp(1.6) },
  vsIcon: {
    marginHorizontal: 15,
    backgroundColor: 'rgba(255,165,0,0.15)',
    padding: 12,
    borderRadius: 50,
    shadowColor: '#FFA500',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  card: {
    backgroundColor: '#faf4f2ff',
    marginHorizontal: wp(5),
    marginTop: hp(2.5),
    borderRadius: 20,
    padding: wp(5),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: hp(2.3),
    fontWeight: '700',
    color: '#1D2671',
    marginBottom: hp(1.5),
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(1.3) },
  detailText: { marginLeft: 10, color: '#333', fontSize: hp(2), fontWeight: '500' },
  timelineCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: wp(5),
    marginTop: hp(2.5),
    borderRadius: 20,
    padding: wp(5),
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(1.5),
  },
  timelineItem: { alignItems: 'center' },
  timelineLine: {
    width: '15%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  timelineText: { color: '#fff', fontSize: hp(1.7), marginTop: 5 },
  termsText: {
    color: '#555',
    fontSize: hp(1.9),
    lineHeight: hp(2.8),
    marginTop: 5,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: wp(5),
    marginTop: hp(3),
  },
  signatureBox: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: wp(3),
    alignItems: 'center',
  },
  signatureLabel: { color: '#fff', fontSize: hp(1.8), opacity: 0.8 },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#FFD700',
    width: '80%',
    marginVertical: hp(1.5),
  },
  signatureName: { color: '#FFD700', fontWeight: '600' },
  button: {
    marginHorizontal: wp(5),
    marginTop: hp(4),
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: hp(4),
  },
  buttonGradient: { paddingVertical: hp(2), alignItems: 'center' },
  buttonText: {
    color: '#fff',
    fontSize: hp(2.1),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
