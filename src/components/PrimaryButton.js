import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function PrimaryButton({ children, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.btnPrimary, style]} onPress={onPress}>
      <Text style={styles.btnPrimaryText}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btnPrimary: {
    backgroundColor: '#5A67D8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
});
