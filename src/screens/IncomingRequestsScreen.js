import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';

export default function IncomingRequestsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [updatingRequestIds, setUpdatingRequestIds] = useState(new Set());

  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;

    const fetchUserAndSubscribe = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (!userData) {
          if (isMounted) setLoading(false);
          return;
        }

        const user = JSON.parse(userData);
        if (isMounted) setCurrentUser(user);

        unsubscribe = firestore()
          .collection('users')
          .doc(user.uid)
          .onSnapshot(
            (doc) => {
              const data = doc.data() || {};
              const reqs = Array.isArray(data.requests) ? data.requests : [];
              if (isMounted) {
                setRequests(reqs);
                setLoading(false);
              }
            },
            (err) => {
              console.error('onSnapshot error:', err);
              if (isMounted) setLoading(false);
            }
          );
      } catch (err) {
        console.error('fetchUser error:', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchUserAndSubscribe();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const setRequestUpdating = (id, updating) => {
    setUpdatingRequestIds((prev) => {
      const copy = new Set(prev);
      if (updating) copy.add(id);
      else copy.delete(id);
      return copy;
    });
  };

  const createContract = async (req) => {
    try {
      const contractData = {
        customerId: req.fromUserId,
        providerId: currentUser.uid,
        service: req.serviceName || "",
        date: req.date || "",
        duration: req.duration || "",
        price: req.price || "",
        description: req.description || "",
        status: "pending",
        customerSignature: null,
        providerSignature: null,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      const ref = await firestore().collection("contracts").add(contractData);
      return ref.id;

    } catch (error) {
      console.error("Contract Creation Error:", error);
      Alert.alert("Error", "Failed to create contract.");
      return null;
    }
  };

  const updateRequestStatus = async (requestIndex, status) => {
    if (!currentUser || !currentUser.uid) {
      Alert.alert("Error", "User not available. Please log in again.");
      return;
    }

    const req = requests[requestIndex];
    const requestId = req.id || req.requestId || `${currentUser.uid}_req_${requestIndex}`;

    setRequestUpdating(requestId, true);

    const userDocRef = firestore().collection("users").doc(currentUser.uid);

    try {
      await firestore().runTransaction(async (tx) => {
        const userDoc = await tx.get(userDocRef);
        if (!userDoc.exists) throw new Error("User doc not found.");

        const data = userDoc.data() || {};
        const existingReqs = Array.isArray(data.requests) ? data.requests : [];

        const updatedReqs = existingReqs.map((r) => ({ ...r }));

        let targetIdx = updatedReqs.findIndex((r) =>
          (r.id && req.id && r.id === req.id) ||
          (r.requestId && req.requestId && r.requestId === req.requestId)
        );

        if (targetIdx === -1) targetIdx = requestIndex;

        updatedReqs[targetIdx] = { ...updatedReqs[targetIdx], status };
        tx.update(userDocRef, { requests: updatedReqs });
      });

      setRequests((prev) => {
        const copy = [...prev];
        copy[requestIndex] = { ...copy[requestIndex], status };
        return copy;
      });

      Alert.alert("Success", `Request ${status}`);

    } catch (error) {
      console.error("Update request error:", error);
      Alert.alert("Error", "Failed to update request. Try again.");
    } finally {
      setRequestUpdating(requestId, false);
    }
  };

  const handleAccept = async (req, index) => {
    try {
      await updateRequestStatus(index, "accepted");

      const contractId = await createContract(req);
      if (!contractId) return;

      navigation.navigate("ContractScreen", {
        contractId,
        loginUserId: currentUser.uid,
        otherUserId: req.fromUserId,
        otherUserName: req.fromUserName,
      });

    } catch (error) {
      console.log("Accept error:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#1D2671", "#C33764"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ marginTop: hp(6), marginHorizontal: hp(1.5) }}>
          <Header navigation={navigation} title="Requests" />
        </View>

        <ScrollView contentContainerStyle={{ padding: wp("5%") }}>
          {requests.length === 0 ? (
            <Text style={styles.noRequests}>You have no incoming requests at the moment.</Text>
          ) : (
            requests.map((req, index) => {
              const key = req.id || req.requestId || String(index);
              const isUpdating = updatingRequestIds.has(
                req.id || req.requestId || `${currentUser?.uid}_req_${index}`
              );

              return (
                <LinearGradient
                  key={key}
                  colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
                  style={styles.card}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.requestText}>From: {req.fromUserName}</Text>
                    <Text
                      style={[
                        styles.statusText,
                        req.status === "pending"
                          ? { color: "#FFD700" }
                          : req.status === "accepted"
                          ? { color: "#00FF7F" }
                          : { color: "#FF4E50" },
                      ]}
                    >
                      {(req.status || "pending").toUpperCase()}
                    </Text>
                  </View>

                  {req.status === "pending" && (
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => handleAccept(req, index)}
                        disabled={isUpdating}
                      >
                        <LinearGradient
                          colors={["#00B09B", "#96C93D"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.buttonGradient}
                        >
                          {isUpdating ? (
                            <ActivityIndicator size="small" />
                          ) : (
                            <Text style={styles.buttonText}>Accept</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => updateRequestStatus(index, "rejected")}
                        disabled={isUpdating}
                      >
                        <LinearGradient
                          colors={["#FF4E50", "#F9D423"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.buttonGradient}
                        >
                          {isUpdating ? (
                            <ActivityIndicator size="small" />
                          ) : (
                            <Text style={styles.buttonText}>Reject</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                </LinearGradient>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1D2671",
  },
  noRequests: {
    color: "#fff",
    textAlign: "center",
    marginTop: hp("5%"),
    fontSize: hp("2%"),
  },
  card: {
    padding: wp("4%"),
    borderRadius: 20,
    marginBottom: hp("2%"),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestText: { color: "#fff", fontSize: hp("2%"), fontWeight: "600" },
  statusText: { fontSize: hp("2%"), fontWeight: "700" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp("2%"),
  },
  button: { flex: 0.48, borderRadius: 25, overflow: "hidden" },
  buttonGradient: { paddingVertical: hp("1.5%"), alignItems: "center" },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: hp("1.8%"),
    textTransform: "uppercase",
  },
});
