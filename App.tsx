// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CalculatorScreen from "./screens/CalculatorScreen";
import CashFlowScreen from "./screens/CashFlowScreen";
import { CashFlowItem } from "./utils"; 

export type RootStackParamList = {
  Calculator: undefined;              
  CashFlow: { data: CashFlowItem[] };  
};

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#2563eb" },
          headerTintColor: "#fff",
        }}
      >
        <Stack.Screen
          name="Calculator"
          component={CalculatorScreen}
        />
        <Stack.Screen
          name="CashFlow"
          component={CashFlowScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}