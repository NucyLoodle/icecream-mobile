import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Pressable, TextInput, Modal } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import config from "@/config";
import * as SecureStore from 'expo-secure-store';
import { useRouter } from "expo-router";

export default function ViewVans() {
	const [vans, setVans] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [id, setId] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editingVan, setEditingVan] = useState<any | null>(null);
	const [editedNickname, setEditedNickname] = useState<string>('');
	const [editedReg, setEditedReg] = useState<string>('');
	const [isDeleting, setIsDeleting] = useState(false);

	const router = useRouter();

	const apiUrl = config.LocalHostAPI;

	useEffect(() => {
		async function getCompanyId() {
			const storedId = await SecureStore.getItemAsync("companyId");
			setId(storedId); 
		}
		getCompanyId();
	}, []); // Only run once when the component mounts

	useEffect(() => {
		if (id && apiUrl) {
			const fetchVans = async () => {
				try {
					console.log("submitting company id", id);
					const response = await fetch(`${apiUrl}/view-vans`, {
						method: "POST",
						headers: {
						"Content-Type": "application/json",
						},
						body: JSON.stringify({ companyId: id }),
					});

					const data: any[] = await response.json();
					setVans(data); // Store vans data after fetching
					console.log(typeof(vans))
				} catch (error) {
					console.error("Error fetching vans:", error);
				} finally {
					setLoading(false); // Stop loading state after fetching
				}
			};

			fetchVans();
			} else {
				console.log("Waiting for companyId...");
			}
		}, [id, apiUrl]); // Fetch vans only when companyId and apiUrl are available

	const handleEdit = (van: any) => {
		setEditingVan(van); 
		setEditedNickname(van.van_nickname); 
		setEditedReg(van.van_reg);
		setIsEditing(true); 
	};

	const handleDelete = (van: any) => {
		setEditingVan(van);
		setIsDeleting(true);
		setEditedNickname(van.van_nickname)
	}

	const handleSave = async () => {
		// Send the update to the backend
		try {
			const response = await fetch(`${apiUrl}/update-van`, {
				method: "POST",
				headers: {
				"Content-Type": "application/json",
				},
				body: JSON.stringify({
				vanId: editingVan.van_id,
				vanNickname: editedNickname,
				vanReg: editedReg,
				}),
			});

			if (response.ok) {
				// Update the vans list with the new values
				const updatedVans = vans.map(van =>
				van.van_id === editingVan.van_id
					? { ...van, van_nickname: editedNickname, van_reg: editedReg }
					: van
				);
				setVans(updatedVans);
				setIsEditing(false); // Close the edit mode
				setEditingVan(null); // Clear the editing van
			} else {
				console.error("Error saving van details");
			}
		} catch (error) {
			console.error("Error updating van:", error);
		}
	};

	const handleClose = () => {
		setIsEditing(false); // Close the edit view without saving
		setEditingVan(null); // Clear the editing van
		setIsDeleting(false);
	};

	const handleConfirmDelete = async () => {
		// Send the update to the backend
		try {
			const response = await fetch(`${apiUrl}/delete-van`, {
				method: "POST",
				headers: {
				"Content-Type": "application/json",
				},
				body: JSON.stringify({
				vanId: editingVan.van_id,
				}),
			});

			if (response.ok) {
				const updatedVans = vans.filter(el => el.van_id !== editingVan.van_id);

				setVans(updatedVans);
				setIsEditing(false); // Close the edit mode
				setEditingVan(null); // Clear the editing van
				setIsDeleting(false);
			} else {
				console.error("Error saving van details");
			}
		} catch (error) {
			console.error("Error updating van:", error);
		}

	}

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
					<TouchableOpacity onPress={() => handleEdit(item)}>
						<FontAwesome5 name="edit" size={20} color="#3e1755" style={styles.icon} />
					</TouchableOpacity>
					<TouchableOpacity onPress={() => handleDelete(item)}>
						<FontAwesome5 name="trash" size={20} color="#da8558" style={styles.icon} />
					</TouchableOpacity>
					</View>
				</View>
				))}
			</View>

			<Modal visible={isEditing} animationType="slide" transparent={true}>
				<View style={styles.modalBackground}>
				<View style={styles.modalContent}>
					<TextInput
					style={styles.input}
					value={editedNickname}
					onChangeText={setEditedNickname}
					/>
					<TextInput
					style={styles.input}
					value={editedReg}
					onChangeText={setEditedReg}
					/>
					<View style={styles.modalButtons}>
					<TouchableOpacity onPress={handleSave} style={styles.saveButton}>
						<Text style={styles.saveText}>Save</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleClose} style={styles.closeButton}>
						<Text style={styles.closeText}>Close</Text>
					</TouchableOpacity>
					</View>
				</View>
				</View>
			</Modal>

			<Modal visible={isDeleting} animationType="slide" transparent={true}>
				<View style={styles.modalBackground}>
				<View style={styles.modalContent}>
					<Text>Are you sure you want to delete {editedNickname}?</Text>
					<View style={styles.modalButtons}>
					<TouchableOpacity onPress={handleConfirmDelete} style={styles.saveButton}>
						<Text style={styles.saveText}>Delete</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleClose} style={styles.closeButton}>
						<Text style={styles.closeText}>Cancel</Text>
					</TouchableOpacity>
					</View>
				</View>
				</View>
			</Modal>



			<Pressable
				onPress={() => router.push("/(auth)/addVans")}
				style={({ pressed }) => [
				{
					backgroundColor: pressed ? '#eee060' : '#b8ecce',
				},
				styles.wrapperCustom,
				]}
			>
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
		width: '40%',
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
		fontFamily: "AlfaSlabOne_400Regular",
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
		justifyContent: "space-between",
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
	modalBackground: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalContent: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 10,
		width: 300,
	},
	input: {
		height: 40,
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 5,
		marginBottom: 10,
		paddingLeft: 10,
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	saveButton: {
		backgroundColor: "#3e1755",
		padding: 10,
		borderRadius: 5,
	},
	closeButton: {
		backgroundColor: "#da8558",
		padding: 10,
		borderRadius: 5,
	},
	saveText: {
		color: "#fff",
		fontWeight: "bold",
	},
	closeText: {
		color: "#fff",
		fontWeight: "bold",
	},
});
