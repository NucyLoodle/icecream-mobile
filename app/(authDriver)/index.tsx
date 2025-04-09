import React, { useEffect, useState } from "react";
import { Text, View, Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';


export default function Index() {
        const router = useRouter();
        const { logout} = useAuth();

    return (
        <View>
        <Text>Driver Homepage</Text>

    <Pressable
        onPress={logout}
            style={({ pressed }) => [
                {
                backgroundColor: pressed ? '#eee060' : '#da8558',
                },
                styles.wrapperCustom,
            ]}
    >
        <Text style={styles.pressable}>Logout</Text>
    </Pressable>
    </View>
    )


}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#eab2bb",
		alignItems: "center",
		justifyContent: "space-around",
		padding: 5,
	},
	heading: {
		color: "#3c6ca8",
		fontFamily: "AlfaSlabOne_400Regular",
		fontSize: 20,
	},
	text: {
		fontFamily: "Poppins_400Regular",
		color: '#3e1755',
		fontSize: 20,
	},
	pressable: {
		fontSize: 20,
		color: '#3e1755',
		textAlign: 'center',
		fontFamily: "Poppins_400Regular",
	},
	wrapperCustom: {
		minWidth: 200,
		borderRadius: 8,
		padding: 6,
		marginTop: 20,
	},
})