import React, { useCallback, useEffect, useState } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { Link } from "expo-router";
import {
  useFonts,
  AlfaSlabOne_400Regular,
} from "@expo-google-fonts/alfa-slab-one";
import * as SplashScreen from "expo-splash-screen";
import { Poppins_400Regular } from "@expo-google-fonts/poppins";
import * as Linking from "expo-linking";

// Keep splash screen visible while loading resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function Index() {
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    AlfaSlabOne_400Regular,
    Poppins_400Regular,
  });

  useEffect(() => {
    const handleDeepLink = (event: Linking.EventType) => {
      const url = event.url;
      const parsed = Linking.parse(url);
      if (parsed.queryParams?.token) {
        setInviteToken(parsed.queryParams.token as string);
        Alert.alert("Invite Token Received", `Token: ${parsed.queryParams.token}`);
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Check if the app was opened via link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, []); 

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Text style={styles.text}>Icecream Tracker</Text>

      
      <Link href="/TrackVan" style={styles.button}>Go to Track Van screen</Link>
      <Link href="/createInvite" style={styles.button}>Sign up</Link>
      <Link href="/verify" style={styles.button}>Verify</Link>
      <Text>Invite Token: {inviteToken ?? "No invite token yet"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eab2bb",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  text: {
    color: "#3c6ca8",
    fontFamily: "AlfaSlabOne_400Regular",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
});
