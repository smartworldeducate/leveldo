import React, { useState, useRef } from "react";
import {
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

export default function GradientButton({
  title = "Continue",
  onPress = async () => {},
}) {
  const [loading, setLoading] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    Animated.spring(anim, {
      toValue: 1,
      speed: 15,
      bounciness: 3,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = async () => {
    Animated.spring(anim, {
      toValue: 0,
      speed: 15,
      bounciness: 3,
      useNativeDriver: true,
    }).start();

    setLoading(true);
    try {
      await onPress();
    } finally {
      setTimeout(() => setLoading(false), 900);
    }
  };

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 6],
  });

  return (
    <TouchableWithoutFeedback
      onPressIn={!loading ? pressIn : undefined}
      onPressOut={!loading ? pressOut : undefined}
    >
      <View style={[styles.shadowLayer, loading && { opacity: 0.8 }]}>
        <Animated.View style={[styles.buttonWrapper, { transform: [{ translateY }] }]}>
          <LinearGradient
            colors={["#d5b9faff", "#9dbff3ff"]}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.button}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Text style={styles.text}>{title}</Text>
            )}
          </LinearGradient>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  shadowLayer: {
    width: 220,
    height: 65,
    backgroundColor: "#004bcc",
    borderRadius: 14,
    paddingBottom: 6,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonWrapper: {
    width: "100%",
    height: "100%",
  },
  button: {
    flex: 1,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
});
