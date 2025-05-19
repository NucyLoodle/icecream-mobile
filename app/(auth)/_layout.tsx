import React from "react"
import { Redirect, Stack } from "expo-router"
import { useAuth } from "@/context/AuthContext";



export default function AuthSharedLayout() {
    const { isAuthenticatedOwner, isAuthenticatedDriver } = useAuth();
    
    if (!isAuthenticatedOwner && !isAuthenticatedDriver) {
        // console.log("Redirecting to /landingPage")
        return <Redirect href="/(publicNavigation)/LandingPage" />
    }
    return (
        <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
            <Stack.Screen name="ChooseVan" options={{ headerShown: false }} />
            <Stack.Screen name="TrackVan" options={{ headerShown: false }} />
        </Stack>

    )
}