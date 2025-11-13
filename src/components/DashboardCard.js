import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DashboardCard({ title, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginRight: 8,
  },
  cardTitle: { color: '#666', fontSize: 13 },
  cardValue: { fontSize: 18, fontWeight: '700', marginTop: 8 },
});
