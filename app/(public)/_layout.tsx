import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function PublicLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // Prevent flickering while checking auth

  if (isAuthenticated) {
    return <Redirect href="/(auth)/(tabs)" />; // Redirect logged-in users
  }

  return <Stack />;
}

