import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { useFonts,AlfaSlabOne_400Regular, } from "@expo-google-fonts/alfa-slab-one";
import { Poppins_400Regular } from "@expo-google-fonts/poppins";


SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
      duration: 1000,
      fade: true,
});


export default function RootLayout() {
    const [fontsLoaded] = useFonts({ AlfaSlabOne_400Regular, Poppins_400Regular, });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }



    return (
        <AuthProvider>
            <Stack>
                <Stack.Screen name="(users)" options={{headerShown: false}}/>
                <Stack.Screen name="(authOwner)" options={{headerShown: false}}/>
                <Stack.Screen name="(authDriver)" options={{headerShown: false}}/>
                <Stack.Screen name="(publicSupplier)" options={{headerShown: false}}/>
                <Stack.Screen name="(auth)" options={{headerShown: false}}/>
                <Stack.Screen name="(preAuth)" options={{headerShown: false}}/>
                <Stack.Screen name="(publicNavigation)" options={{headerShown: false}}/>
            </Stack>
        </AuthProvider>
    )
}