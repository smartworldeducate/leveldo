// CalculatorScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  calculateCurrentYield,
  calculateTotalInterest,
  calculateYTM,
  generateCashFlow,
  formatCurrency,
  formatPercent,
  CashFlowItem,
} from "../utils";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

// ----------------------------
// Type for navigation props
// ----------------------------
type Props = NativeStackScreenProps<RootStackParamList, "Calculator">;

// ----------------------------
// Type for form state
// ----------------------------
type FormState = {
  faceValue: string;
  couponRate: string;
  marketPrice: string;
  years: string;
  frequency: number;
};

// ----------------------------
// Type for results
// ----------------------------
type Results = {
  currentYield: number;
  totalInterest: number;
  ytm: number;
  status: "Premium" | "Discount" | "Par";
  flow: CashFlowItem[];
} | null;

export default function CalculatorScreen({ navigation }: Props) {
  const [form, setForm] = useState<FormState>({
    faceValue: "",
    couponRate: "",
    marketPrice: "",
    years: "",
    frequency: 2,
  });

  const [results, setResults] = useState<Results>(null);

  const handleChange = (key: keyof FormState, value: string | number) => {
    setForm({ ...form, [key]: value });
  };

  const handleCalculate = () => {
    const fv = parseFloat(form.faceValue);
    const cr = parseFloat(form.couponRate);
    const mp = parseFloat(form.marketPrice);
    const y = parseFloat(form.years);
    const freq = form.frequency;

    if (!fv || !cr || !mp || !y) {
      alert("Please fill all fields");
      return;
    }

    if (fv <= 0 || mp <= 0 || y <= 0) {
      alert("Values must be greater than 0");
      return;
    }

    const currentYield = calculateCurrentYield(fv, cr, mp);
    const totalInterest = calculateTotalInterest(fv, cr, y, freq);
    const ytm = calculateYTM(fv, mp, cr, y, freq);
    const flow = generateCashFlow(fv, cr, y, freq);

    const status: "Premium" | "Discount" | "Par" =
      mp > fv ? "Premium" : mp < fv ? "Discount" : "Par";

    setResults({ currentYield, totalInterest, ytm, status, flow });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bond Calculator</Text>

      {(["faceValue", "couponRate", "marketPrice", "years"] as (keyof FormState)[]).map((field) => (
        <TextInput
          key={field}
          placeholder={field}
          keyboardType="numeric"
          style={styles.input}
          value={form[field].toString()}
          onChangeText={(val) => handleChange(field, val)}
        />
      ))}

      <View style={styles.freqContainer}>
        <TouchableOpacity
          style={[
            styles.freqButton,
            form.frequency === 1 && styles.active,
          ]}
          onPress={() => handleChange("frequency", 1)}
        >
          <Text
            style={[
              styles.freqText,
              form.frequency === 1 && styles.activeText,
            ]}
          >
            Annual
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.freqButton,
            form.frequency === 2 && styles.active,
          ]}
          onPress={() => handleChange("frequency", 2)}
        >
          <Text
            style={[
              styles.freqText,
              form.frequency === 2 && styles.activeText,
            ]}
          >
            Semi
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCalculate}>
        <Text style={styles.buttonText}>Calculate</Text>
      </TouchableOpacity>

      {results && (
        <View style={styles.card}>
          <Text style={styles.result}>
            Current Yield: {formatPercent(results.currentYield)}
          </Text>

          <Text style={styles.result}>
            YTM: {results.ytm.toFixed(2)}%
          </Text>

          <Text style={styles.result}>
            Total Interest: {formatCurrency(results.totalInterest)}
          </Text>

          <Text
            style={[
              styles.result,
              {
                color:
                  results.status === "Premium"
                    ? "#16a34a"
                    : results.status === "Discount"
                    ? "#dc2626"
                    : "#64748b",
              },
            ]}
          >
            Status: {results.status}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate("CashFlow", {
                data: results.flow,
              })
            }
          >
            <Text style={styles.buttonText}>View Cash Flow</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// ----------------------------
// Styles
// ----------------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8fafc" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 15 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  card: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 15,
  },
  freqContainer: { flexDirection: "row", gap: 10, marginBottom: 10 },
  freqButton: {
    flex: 1,
    padding: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
  },
  active: { backgroundColor: "#2563eb" },
  freqText: {
    textAlign: "center",
    color: "#475569",
  },
  activeText: {
    color: "#fff",
  },
  result: {
    fontSize: 16,
    marginBottom: 6,
    paddingHorizontal: 10,
  },
});