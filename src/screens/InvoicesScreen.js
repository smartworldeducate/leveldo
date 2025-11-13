import React from 'react';
import { SafeAreaView, View, Text, FlatList } from 'react-native';
import styles from '../styles/globalStyles';

const DATA = [{ id: 'i1', label: 'Invoice #1201', amount: 'Rs 4,000', status: 'Unpaid' }];

export default function InvoicesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text style={styles.title}>Invoices</Text>
        <FlatList
          data={DATA}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={[styles.card, { marginTop: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <View>
                <Text style={{ fontWeight: '700' }}>{item.label}</Text>
                <Text style={{ color: '#666' }}>{item.amount}</Text>
              </View>
              <Text style={{ backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>{item.status}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
