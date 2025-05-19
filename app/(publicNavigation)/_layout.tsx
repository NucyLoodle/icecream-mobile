import React from "react"
import { Redirect, Stack } from "expo-router"
import { useAuth } from "@/context/AuthContext";



export default function LandingPageLayout() {
    const { isAuthenticatedOwner, isAuthenticatedDriver } = useAuth();
    
    if (isAuthenticatedOwner) {
        // console.log("Redirecting to owner home page")
        return <Redirect href="/(authOwner)/(tabsOwner)" />
    }
    if (isAuthenticatedDriver) {
        // console.log("Redirecting to driver home page")
        return <Redirect href="/(authDriver)" />
    }
    return (
        <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
            <Stack.Screen name="LandingPage" options={{ headerShown: false }} />
        </Stack>

    )
}