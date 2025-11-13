import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import styles from '../styles/globalStyles';

export default function AddProjectScreen({ navigation }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text style={styles.title}>Add Project</Text>

        <TextInput style={styles.input} placeholder="Project name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
        <TextInput style={styles.input} placeholder="Estimated budget" keyboardType="numeric" value={budget} onChangeText={setBudget} />

        <PrimaryButton style={{ marginTop: 12 }} onPress={() => alert('Project created (mock)')}>
          Create Project
        </PrimaryButton>
      </View>
    </SafeAreaView>
  );
}
