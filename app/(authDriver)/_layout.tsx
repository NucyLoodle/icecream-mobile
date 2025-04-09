import React from "react"
import { Redirect, Stack } from "expo-router"
import { useAuth } from "@/context/AuthContext";



export default function AuthDriverLayout() {
    const { isAuthenticatedDriver } = useAuth();
    
    if (!isAuthenticatedDriver) {
        console.log("Redirecting to /home")
        console.log(isAuthenticatedDriver)
        return <Redirect href="/(publicSupplier)/Home" />
    }
    return (
        <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            
        
        </Stack>

    )
}