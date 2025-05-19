import React from "react"
import { Redirect, Stack } from "expo-router"
import { useAuth } from "@/context/AuthContext";



export default function AuthOwnerLayout() {
    const { isAuthenticatedOwner } = useAuth();
    
    if (!isAuthenticatedOwner) {
        // console.log("Redirecting to /home")
        return <Redirect href="/(publicNavigation)/LandingPage" />
    }
    return (
        <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
            <Stack.Screen name="(tabsOwner)" options={{ headerShown: false }} />
            <Stack.Screen name="viewVans" options={{ title: "View your Vans", headerShown: false }} />
            <Stack.Screen name="viewDrivers" options={{ title: "View your Drivers", headerShown: false }} />
        </Stack>

    )
}