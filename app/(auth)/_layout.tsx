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
            <Stack.Screen name="create" options={{ title: "Create something" }} />
        </Stack>

    )
}