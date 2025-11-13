import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { CameraScreen } from 'react-native-camera-kit';
import styles from '../styles/globalStyles';
import PrimaryButton from '../components/PrimaryButton';

export default function CheckInScreen({ navigation }) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const onCapture = (image) => {
    // image.path or image.base64 depending on platform / config
    setIsCameraOpen(false);
    Alert.alert('Captured', 'Image captured (mock).');
    // TODO: upload or save image
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text style={styles.title}>Check In / Check Out</Text>
        <Text style={{ marginTop: 8 }}>Use camera to capture proof or check-in photo.</Text>

        {!isCameraOpen && (
          <View style={{ marginTop: 12 }}>
            <PrimaryButton onPress={() => setIsCameraOpen(true)}>Open Camera</PrimaryButton>
            <PrimaryButton style={{ marginTop: 8 }} onPress={() => Alert.alert('Checked in', 'Mock check-in successful')}>Check In (Mock)</PrimaryButton>
          </View>
        )}

        {isCameraOpen && (
          <View style={{ height: 420, marginTop: 12 }}>
            <CameraScreen
              actions={{
                rightButtonText: 'Capture',
                leftButtonText: 'Cancel',
              }}
              onBottomButtonPressed={(event) => {
                const captureImages = event.captureImages || [];
                // captureImages[0].uri typically
                onCapture(captureImages[0]);
              }}
              // showFrame={false}
              // scanBarcode={false}
            />
            <TouchableOpacity onPress={() => setIsCameraOpen(false)} style={{ marginTop: 8 }}>
              <Text style={{ color: '#5A67D8', fontWeight: '700' }}>Close Camera</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
