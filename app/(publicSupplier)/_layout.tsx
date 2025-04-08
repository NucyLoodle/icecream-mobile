import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function PublicLayout() {
	const { isAuthenticated, loading } = useAuth();

	if (loading) return null; // Prevent flickering while checking auth

	if (isAuthenticated) {
		return <Redirect href="/(auth)/(tabsOwner)" />; // Redirect logged-in users
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

