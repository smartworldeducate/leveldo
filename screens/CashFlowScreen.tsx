// CashFlowScreen.tsx
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { formatCurrency, CashFlowItem } from "../utils";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
type Props = NativeStackScreenProps<RootStackParamList, "CashFlow">;
export default function CashFlowScreen({ route }: Props) {
  const { data } = route.params;
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Data Available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cash Flow Schedule</Text>

      <View style={styles.header}>
        <Text style={styles.headerText}>Period</Text>
        <Text style={styles.headerText}>Date</Text>
        <Text style={styles.headerText}>Coupon</Text>
        <Text style={styles.headerText}>Cumulative</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item: CashFlowItem) => item.period.toString()}
        renderItem={({ item }: { item: CashFlowItem }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>P{item.period}</Text>
            <Text style={styles.cell}>{item.paymentDate || "-"}</Text>
            <Text style={styles.cell}>{formatCurrency(item.couponPayment)}</Text>
            <Text style={styles.cell}>{formatCurrency(item.cumulativeInterest)}</Text>
          </View>
        )}
      />
    </View>
  );
}

// ----------------------------
// Styles
// ----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f1f5f9",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 5,
    borderRadius: 8,
  },
  cell: {
    flex: 1,
    fontSize: 12,
  },
});