import React, { useState } from 'react';
import { SafeAreaView, View, TextInput, Text } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import styles from '../styles/globalStyles';

export default function WorkLogScreen() {
  const [type, setType] = useState('');
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState('');

  const save = () => {
    const total = Number(hours || 0) * Number(rate || 0);
    alert(`Saved (mock): ${type} - ${hours} hrs - Rs ${total}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text style={styles.title}>Add Work Entry</Text>
        <TextInput style={styles.input} placeholder="Work type" value={type} onChangeText={setType} />
        <TextInput style={styles.input} placeholder="Hours worked" keyboardType="numeric" value={hours} onChangeText={setHours} />
        <TextInput style={styles.input} placeholder="Rate per hour" keyboardType="numeric" value={rate} onChangeText={setRate} />
        <PrimaryButton style={{ marginTop: 12 }} onPress={save}>Save Entry</PrimaryButton>
      </View>
    </SafeAreaView>
  );
}
