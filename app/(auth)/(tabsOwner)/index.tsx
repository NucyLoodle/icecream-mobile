import React, { useEffect, useState } from "react";
import { Text, View, Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';

export default function Index() {
	// logged in users can see this page
	const [name, setName] = useState<string | null>(null);
	const router = useRouter();
	const { logout} = useAuth();

	useEffect(() => {
		async function fetchName() {
			const storedName = await SecureStore.getItemAsync("firstName");
			setName(storedName);
		}
		fetchName();
	}, []);

  	return (

		<SafeAreaView style={styles.container}>
			<Text style={styles.heading}>Welcome, {name}!</Text>
			<Text style={styles.text}>What would you like to do today?</Text>
			<View>
				<Pressable
					onPress={() => router.push("/(auth)/viewVans")}
						style={({ pressed }) => [
							{
							backgroundColor: pressed ? '#eee060' : '#b8ecce',
							},
							styles.wrapperCustom,
						]}
				>
					<Text style={styles.pressable}>View my Vans</Text>
				</Pressable>
				<Pressable
					onPress={() => router.push("/(auth)/viewDrivers")}
						style={({ pressed }) => [
							{
							backgroundColor: pressed ? '#eee060' : '#b8ecce',
							},
							styles.wrapperCustom,
						]}
				>
					<Text style={styles.pressable}>View my Drivers</Text>
				</Pressable>
				<Pressable
					onPress={() => router.push("/(auth)/TrackVan")}
						style={({ pressed }) => [
							{
							backgroundColor: pressed ? '#eee060' : '#b8ecce',
							},
							styles.wrapperCustom,
						]}
				>
					<Text style={styles.pressable}>Share my Location</Text>
				</Pressable>
			</View>

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
		</SafeAreaView>
  );
};

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