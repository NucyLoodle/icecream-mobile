import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Pressable, TextInput, Modal, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import config from "@/config";
import * as SecureStore from 'expo-secure-store';
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";



const schema = z.object({
	vanReg: z.string()
					.nonempty({ message: "Van registration required" })
					.min(2, { message: "Must be at least 2 characters" }),
	vanNickname: z.string()
					.optional(),
});



export default function ViewVans() {
	const [vans, setVans] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [id, setId] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editingVan, setEditingVan] = useState<any | null>(null);
	const [editedNickname, setEditedNickname] = useState<string>('');
	const [isDeleting, setIsDeleting] = useState(false);

	const vanRegRef = useRef<TextInput>(null);
	const vanNicknameRef = useRef<TextInput>(null);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	  } = useForm({
		resolver: zodResolver(schema),
		mode: 'onChange',
	  });

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
					const response = await fetch(`${apiUrl}/view-vans`, {
						method: "POST",
						headers: {
						"Content-Type": "application/json",
						},
						body: JSON.stringify({ companyId: id }),
					});

					const data: any[] = await response.json();
					setVans(data); // Store vans data after fetching
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
		reset({
		  vanReg: van.van_reg,
		  vanNickname: van.van_nickname || '',
		});
		setIsEditing(true);
	  };

	const handleDelete = (van: any) => {
		setEditingVan(van);
		setIsDeleting(true);
		setEditedNickname(van.van_nickname)
	}


	const onSubmit = async (data: any) => {
		if (data.vanNickname === editingVan.van_nickname && data.vanReg === editingVan.van_reg) {
			Alert.alert("No changes detected", "Please make some changes before saving.");
			return; 
		}
		try {
			const response = await fetch(`${apiUrl}/update-van`, {
				method: "POST",
				headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				vanId: editingVan.van_id,
				vanNickname: data.vanNickname,
				vanReg: data.vanReg,
			}),
		  });

		  	const result = await response.json();
	  
			if (response.ok) {
				const updatedVans = vans.map(van =>
				van.van_id === editingVan.van_id
					? { ...van, van_nickname: data.vanNickname, van_reg: data.vanReg }
					: van
				);
				setVans(updatedVans);
				setIsEditing(false);
				setEditingVan(null);
			} else {
				throw new Error(result.error || "Failed to add van");
			}

		} catch (error: any) {
			if (error.message === "Already registered") {
				Alert.alert("Error", "This van is already registered"); 
			}
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
		<SafeAreaView style={styles.container}>
			<ScrollView>
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
					<Text style={styles.text}>Van Registration Plate</Text>
					<Controller
						control={control}
						name="vanReg"
						render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							ref={vanRegRef}
							onSubmitEditing={() => vanNicknameRef.current?.focus()}
							returnKeyType="next"
							style={styles.input}
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							blurOnSubmit={false}
						/>
						)}
					/>
					{errors.vanReg && <Text style={styles.error}>{errors.vanReg.message}</Text>}

					<Text style={styles.text}>Van Nickname</Text>
					<Controller
						control={control}
						name="vanNickname"
						render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							ref={vanNicknameRef}
							returnKeyType="done"
							style={styles.input}
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							blurOnSubmit={false}
						/>
						)}
					/>
					{errors.vanNickname && <Text style={styles.error}>{errors.vanNickname.message}</Text>}

					<View style={styles.modalButtons}>
						<TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.saveButton}>
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

			</ScrollView>
		</SafeAreaView>
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
	error: {

	},
	text: {

	}
});
