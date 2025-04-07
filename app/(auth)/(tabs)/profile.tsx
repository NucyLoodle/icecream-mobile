import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import config from "@/config";
import * as SecureStore from 'expo-secure-store';

export default function Profile() {
	const [loading, setLoading] = useState(true);
	const [id, setId] = useState<string | null>(null);
	const [info, setInfo] = useState<any>(null); // Optionally type this better
	const apiUrl = config.LocalHostAPI;

	useEffect(() => {
		async function getCompanyId() {
			const storedId = await SecureStore.getItemAsync("companyId");
			setId(storedId); 
		}
		getCompanyId();
	}, []); 
	
	useEffect(() => {
		if (id && apiUrl) {
			const fetchUserInfo = async () => {
				try {
					const response = await fetch(`${apiUrl}/view-profile`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ companyId: id }),
					});
					const data = await response.json();
					setInfo(data);
				} catch (error) {
					console.error("Error fetching info:", error);
				} finally {
					setLoading(false); 
				}
			};
			fetchUserInfo();
		}
	}, [id, apiUrl]); 

	// Early return while loading or info is null
	if (loading || !info) {
		return (
			<SafeAreaView style={styles.container}>
				<Text style={styles.text}>Loading...</Text>
			</SafeAreaView>
		);
	}

	const { company_name: companyName, email, owner_first_name: firstName, owner_surname: lastName, url, phone } = info[0];

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.heading}>Your Details</Text>
			<View>

				<Text style={styles.text}>Company Name: </Text>
				<Text style={styles.info}>{companyName}</Text>
				<Text style={styles.text}>First Name:</Text>
				<Text style={styles.info}>{firstName}</Text>
				<Text style={styles.text}>Last Name:</Text>
				<Text style={styles.info}>{lastName}</Text>
				<Text style={styles.text}>Company Website:</Text>
				<Text style={styles.info}>{url}</Text>
				<Text style={styles.text}>Contact Email:</Text>
				<Text style={styles.info}>{email}</Text>
				<Text style={styles.text}>Contact Phone:</Text>
				<Text style={styles.info}>{phone}</Text>
			</View>
			<Text style={styles.text}>Contact us to update your info</Text>
		</SafeAreaView>
	);
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#eab2bb",
		alignItems: "flex-start",
		justifyContent: "space-between",
		padding: 5,
	},
	heading: {
		color: "#3c6ca8",
		fontFamily: "AlfaSlabOne_400Regular",
		fontSize: 30,
	},
	text: {
		fontFamily: "Poppins_400Regular",
		color: '#3e1755',
		fontSize: 20,
	},
	info: {
		fontFamily: "Poppins_400Regular",
		color: '#3c6ca8',
		fontSize: 20,
		backgroundColor: '#eee060'
	},
});