import React from "react"
import { Redirect, Stack } from "expo-router"
import { useAuth } from "@/context/AuthContext";



export default function AuthLayout() {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        console.log("Redirecting to /home")
        return <Redirect href="/(public)/Home" />
    }
    return (
        <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="viewVans" options={{ title: "View your Vans", headerShown: false }} />
            <Stack.Screen name="viewDrivers" options={{ title: "View your Drivers", headerShown: false }} />
        </Stack>

    )
}