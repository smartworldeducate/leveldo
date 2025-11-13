import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'react-native-camera-kit';
import { ArrowLeft } from 'lucide-react-native';

export default function TestQRScanner({ navigation }) {
  const [isScanning, setIsScanning] = useState(true);

  const onBarcodeScan = (event) => {
    if (!isScanning) return;
    setIsScanning(false);

    const value = event.nativeEvent.codeStringValue;

    Alert.alert("QR Code Scanned", value, [
      {
        text: "OK",
        onPress: () => {
          navigation.goBack();
        }
      }
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft color="#fff" size={28} />
      </TouchableOpacity>

      <Camera
        scanBarcode={true}
        onReadCode={onBarcodeScan}
        showFrame={true}
        laserColor={"#00FF00"}
        frameColor={"#FFFFFF"}
        hideControls={true}
        style={{ flex: 1, backgroundColor: "#000" }}
      />

      <View style={styles.bottomLabel}>
        <Text style={styles.labelText}>Scan QR Code</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 999,
    padding: 10
  },
  bottomLabel: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center"
  },
  labelText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12
  }
});
