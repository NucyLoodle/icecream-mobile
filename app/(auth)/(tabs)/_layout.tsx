import React from "react";
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function TabLayout() {
    return(
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                title: "Home",
                tabBarIcon: ({ color, size }) => (
                    <FontAwesome name="home" size={size} color={color} />
                ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                title: "Profile",
                tabBarIcon: ({ color, size }) => (
                    <FontAwesome name="gear" size={size} color={color} />
                ),
                }}
            />
        </Tabs>
    )
}