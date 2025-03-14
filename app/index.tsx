import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import * as dotenv from 'dotenv';
import { Text, View,  StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import {
  useFonts,
  AlfaSlabOne_400Regular,
} from "@expo-google-fonts/alfa-slab-one";
import * as SplashScreen from 'expo-splash-screen';

import {
  Poppins_400Regular,
}  from "@expo-google-fonts/poppins";


// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function Index() {
  const [fontsLoaded] = useFonts({
    AlfaSlabOne_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      // Hide the splash screen once fonts are loaded
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Keep splash screen visible while loading fonts
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Text style={styles.text}>Icecream Tracker</Text>

      
      <Link href="/TrackVan" style={styles.button}>
      Go to Track Van screen
    </Link>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eab2bb',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text: {
    color: '#3c6ca8',
    fontFamily: 'AlfaSlabOne_400Regular',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});
