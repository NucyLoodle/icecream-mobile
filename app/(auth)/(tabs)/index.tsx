import React from "react";
import { Text, View, Pressable } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  // logged in users can see this page
  const { logout} = useAuth();
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
      <Link href="/(auth)/TrackVan">Start Tracking</Link>
      <Pressable onPress={logout}><Text>Logout</Text></Pressable>
    </View>
  );
}