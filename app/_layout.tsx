import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";


export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack>
                <Stack.Screen name="(auth)" options={{headerShown: false}}/>
                <Stack.Screen name="(public)" options={{headerShown: false}}/>
                
            </Stack>
        </AuthProvider>
    )

}