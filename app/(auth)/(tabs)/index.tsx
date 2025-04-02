import React, { useEffect, useState } from "react";
import { Text, View, Pressable } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  // logged in users can see this page
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchName() {
      const storedName = await SecureStore.getItemAsync("firstName");
      setName(storedName);
    }
    fetchName();
  }, []);


  const { logout} = useAuth();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Welcome {name}!</Text>
      <Text>What would you like to do today?</Text>
      <Link href="/(auth)/create">View Vans</Link>
      <Link href="/(auth)/create">View Drivers</Link>
      <Link href="/(auth)/TrackVan">Share My Location</Link>
      <Pressable onPress={logout}><Text>Logout</Text></Pressable>
    </View>
  );
}