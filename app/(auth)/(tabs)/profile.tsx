import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
	// logged in users can see this page
	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.heading}>Your Details</Text>
			<View>
				<Text style={styles.text}>Company Name: </Text>
				<Text style={styles.text}>First Name: </Text>
				<Text style={styles.text}>Last Name: </Text>
				<Text style={styles.text}>Company Website: </Text>
				<Text style={styles.text}>Contact Email: </Text>
				<Text style={styles.text}>Contact Phone: </Text>
			</View>
			<Text style={styles.text}>Contact us to update your info</Text>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#eab2bb",
		alignItems: "center",
		justifyContent: "center",
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
});