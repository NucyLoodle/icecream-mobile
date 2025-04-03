import React from "react";
import { Text, View, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function ViewVans() {
	const vans = [
		{ van_id: 1, van_reg: "FV09 GHT", van_nickname: "Frosty Express" },
		{ van_id: 2, van_reg: "GH67 4FG", van_nickname: "Chilly Wheels" }
	];

	return (
		<View style={styles.container}>
			<Text style={styles.heading}>View Your Vans</Text>
			<View style={styles.gridContainer}>
				{vans.map((item) => (
				<View key={item.van_id} style={styles.vanCard}>
					<Text style={styles.vanNickname}>{item.van_nickname}</Text>
					<FontAwesome5 name="truck" size={40} color="#b8ecce" />
					<View style={styles.regPlate}>
					<Text style={styles.regPlateText}>{item.van_reg}</Text>
					</View>
					<View style={styles.iconContainer}>
					<TouchableOpacity onPress={() => console.log("Edit", item.van_id)}>
						<FontAwesome5 name="edit" size={20} color="#3e1755" style={styles.icon} />
					</TouchableOpacity>
					<TouchableOpacity onPress={() => console.log("Delete", item.van_id)}>
						<FontAwesome5 name="trash" size={20} color="#da8558" style={styles.icon} />
					</TouchableOpacity>
					</View>
				</View>
				))}
			</View>			
			<Pressable
				onPress={() => console.log("Pressed")}
				style={({pressed}) => [
					{
					backgroundColor: pressed ? '#eee060' : '#b8ecce',
					},
					styles.wrapperCustom,
				]}>         
				<Text style={styles.pressable}>Add Van</Text>        
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#eab2bb",
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
		// fontFamily: "Poppins_400Regular",
		fontFamily:"AlfaSlabOne_400Regular",
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 5,
		textAlign: "center",
		color: "#3c6ca8",
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
	gridContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-evenly",
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
});
