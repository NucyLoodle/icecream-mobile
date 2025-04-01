import React from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Welcome!</Text>
      <Text style={{ marginBottom: 20 }}>Join us or log in to continue.</Text>
      
      <Button title="Register" onPress={() => router.push("/(public)/createInvite")} />
      <Button title="Verify Email" onPress={() => router.push("/(public)/Verify")} />
      <Button title="Login" onPress={() => router.push("/(public)/Login")} />
    </View>
  );
}