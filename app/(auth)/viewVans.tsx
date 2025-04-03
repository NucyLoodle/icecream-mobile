import React from "react";
import { Text, View, StyleSheet } from "react-native";

export default function ViewVans() {
	// logged in users can see this page

	// fetch number of vans and their details from db
	// create elements to match number of vans
	// display van reg
	// button to add vans
	// show form to fill out

	//hardcoded value for testing
	const vans = [
		{
			van_id: 1,
			van_reg: "FV09 GHT"
		},
		{
			van_id: 2,
			van_reg: "GH67 4FG"
		}
	];


  return (
		<View style={styles.container}>
			<Text>View Your Vans</Text>

			{vans.map((van) => {
				return (
				<View key={van.van_id}>
					<Text style={styles.item}>{van.van_reg}</Text>
				</View>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 50,
	},
	item: {
		padding: 20,
		fontSize: 15,
		marginTop: 5,
	}
});