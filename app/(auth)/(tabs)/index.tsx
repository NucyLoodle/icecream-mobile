import React from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  // logged in users can see this page
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Link href="/(auth)/create">Create Something</Link>
    </View>
  );
}