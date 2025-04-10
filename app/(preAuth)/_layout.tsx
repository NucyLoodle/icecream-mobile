import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function PreAuthLayout() {
    const { isAuthenticatedOwner, isAuthenticatedDriver, loading } = useAuth();

    if (loading) return null; // Prevent flickering while checking auth

    if (isAuthenticatedOwner) {
        return <Redirect href="/(authOwner)/(tabsOwner)" />;
    } else if (isAuthenticatedDriver) {
        return <Redirect href="/(authDriver)" />; 
    }

    return (
        <Stack>
            <Stack.Screen name="createPassword" options={{headerShown: false}}/>
        </Stack>
    )
}

