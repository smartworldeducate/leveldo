import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFC' },
  title: { fontSize: 26, fontWeight: '700', color: '#1F2937' },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    elevation: 3,
  },
  progressBarBackground: { backgroundColor: '#F3F4F6', borderRadius: 8, height: 8, width: width * 0.45, marginTop: 8 },
  progressFill: { backgroundColor: '#5A67D8', height: 8, borderRadius: 8 },
});
