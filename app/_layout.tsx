import React, { useState, useEffect } from "react";
import "expo-dev-client";
import { createStackNavigator } from "@react-navigation/stack";
import Index from "./index";
import CreateInvite from "./createInvite";
import TrackVan from "./TrackVan";
import Verify from "./Verify";
import Login from "./Login";
import * as SecureStore from "expo-secure-store";
import { View, ActivityIndicator } from "react-native";

const Stack = createStackNavigator();

export default function RootLayout() {
  const [isSignedIn, setIsSignedIn] = useState<null | boolean>(null);

  useEffect(() => {
    async function checkAuthStatus() {
      const token = await SecureStore.getItemAsync("userToken");
      setIsSignedIn(!!token); // Convert token to boolean
    }
    checkAuthStatus();
  }, []);

  if (isSignedIn === null) {
    // Show a loading screen while checking auth status
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <>
          <Stack.Screen name="index" component={Index} />
          <Stack.Screen name="TrackVan" component={TrackVan} />
        </>
      ) : (
        <>
          <Stack.Screen name="index" component={Index} />
          <Stack.Screen name="createInvite" component={CreateInvite} />
          <Stack.Screen name="Verify" component={Verify} />
          <Stack.Screen name="Login" component={Login} />
        </>
      )}
    </Stack.Navigator>
  );
}
