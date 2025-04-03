import React from "react";
import { Text, View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function ViewVans() {
	const vans = [
		{ van_id: 1, van_reg: "FV09 GHT", van_nickname: "Frosty Express" },
		{ van_id: 2, van_reg: "GH67 4FG", van_nickname: "Chilly Wheels" }
	];

	return (
		<View style={styles.container}>
			<Text style={styles.heading}>View Your Vans</Text>
			<FlatList
				data={vans}
				numColumns={2}
				keyExtractor={(item) => item.van_id.toString()}
				renderItem={({ item }) => (
					<View style={styles.vanCard}>
						<Text style={styles.vanNickname}>{item.van_nickname}</Text>
						<FontAwesome5 name="truck" size={40} color="black" />
						<View style={styles.regPlate}>
							<Text style={styles.regPlateText}>{item.van_reg}</Text>
						</View>
						<View style={styles.iconContainer}>
							<TouchableOpacity onPress={() => console.log("Edit", item.van_id)}>
								<FontAwesome5 name="edit" size={20} color="blue" style={styles.icon} />
							</TouchableOpacity>
							<TouchableOpacity onPress={() => console.log("Delete", item.van_id)}>
								<FontAwesome5 name="trash" size={20} color="red" style={styles.icon} />
							</TouchableOpacity>
						</View>
					</View>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f8f9fa",
	},
	heading: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	vanCard: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "white",
		padding: 20,
		margin: 10,
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	vanNickname: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 5,
		textAlign: "center",
		color: "#333",
	},
	regPlate: {
		marginTop: 10,
		backgroundColor: "#FFD700",
		paddingVertical: 2,
		paddingHorizontal: 15,
		borderRadius: 5,
		borderWidth: 2,
		borderColor: "#000",
		textAlign: "center",
		minWidth: 100,
		overflow: "hidden",
	},
	regPlateText: {
		fontSize: 14,
		fontWeight: "bold",
	},
	iconContainer: {
		flexDirection: "row",
		marginTop: 10,
	},
	icon: {
		marginHorizontal: 10,
	},
});
