import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function PublicLayout() {
	const { isAuthenticatedOwner, isAuthenticatedDriver, loading } = useAuth();

	if (loading) return null; // Prevent flickering while checking auth

	if (isAuthenticatedOwner) {
		return <Redirect href="/(authOwner)/(tabsOwner)" />; // Redirect logged-in users
	} else if (isAuthenticatedDriver) {
		return <Redirect href="/(authDriver)" />; 
	}

	return (
		<Stack>
			<Stack.Screen name="Login" options={{headerShown: false}}/>
			<Stack.Screen name="createInvite" options={{headerShown: false}}/>
			<Stack.Screen name="Verify" options={{headerShown: false}}/>
			<Stack.Screen name="Home" options={{headerShown: false}}/>
		</Stack>
	)
}

