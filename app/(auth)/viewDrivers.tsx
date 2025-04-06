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
	email: z.string()
          .email({ message: "Invalid email address" })
          .nonempty({ message: "Email is required" })
          .transform((email) => email.toLowerCase()),
	firstName: z.string()
              .nonempty({ message: "First name required" })
              .min(2, { message: "Must be at least 2 characters" }),
  lastName: z.string()
              .nonempty({ message: "Last name required" })
              .min(2, { message: "Must be at least 2 characters" }),
});



export default function ViewDrivers() {
	const [drivers, setDrivers] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [id, setId] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editingDriver, setEditingDriver] = useState<any | null>(null);
	const [editedFirstName, setEditedFirstName] = useState<string>('');
  const [editedLastName, setEditedLastName] = useState<string>('');
  const [editedEmail, setEditedEmail] = useState<string>('');
	const [isDeleting, setIsDeleting] = useState(false);

	const firstNameRef = useRef<TextInput>(null);
	const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

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
			const fetchDrivers = async () => {
				try {
					const response = await fetch(`${apiUrl}/view-drivers`, {
						method: "POST",
						headers: {
						"Content-Type": "application/json",
						},
						body: JSON.stringify({ companyId: id }),
					});

					const rawData: any[] = await response.json();
          const data = rawData.map(driver => ({
            driverId: driver.driver_id,
            firstName: driver.driver_first_name,
            lastName: driver.driver_last_name,
            companyId: driver.company_id,
            email: driver.email,
            role: driver.role,
            isActive: driver.is_active,
          }));
          console.log(data)
					setDrivers(data); 
				} catch (error) {
					console.error("Error fetching drivers:", error);
				} finally {
					setLoading(false);
				}
			};

			fetchDrivers();
			} else {
				console.log("Waiting for companyId...");
			}
		}, [id, apiUrl]); 


	const handleEdit = (driver: any) => {
		setEditingDriver(driver);
		reset({
		  firstName: driver.firstName,
		  lastName: driver.lastName,
      email: driver.email,
		});
		setIsEditing(true);
	  };

	const handleDelete = (driver: any) => {
		setEditingDriver(driver);
		setIsDeleting(true);
		setEditedEmail(driver.email)
    setEditedFirstName(driver.firstName);
    setEditedLastName(driver.lastName); 
	}


	const onSubmit = async (data: any) => {
		if (data.firstName === editingDriver.firstName && data.lastName === editingDriver.lastName && data.email === editingDriver.email) {
			Alert.alert("No changes detected", "Please make some changes before saving.");
			return; 
		}
		try {
			const response = await fetch(`${apiUrl}/update-drivers`, {
				method: "POST",
				headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
        driver_id: editingDriver.driverId,
        company_id: id,
        ...data
			}),
		  });

		  	const result = await response.json();
	  
			if (response.ok) {
				const updatedDrivers = drivers.map(driver =>
				driver.driverId === editingDriver.driverId
					? { ...driver, firstName: data.firstName, lastName: data.lastName, email: data.email }
					: driver
				);
				setDrivers(updatedDrivers);
				setIsEditing(false);
				setEditingDriver(null);
			} else {
				throw new Error(result.error || "Failed to update driver");
			}

		} catch (error: any) {
			if (error.message === "Already registered") {
				Alert.alert("Error", "This driver is already registered"); 
			}
		}
	};

	  
	const handleClose = () => {
		setIsEditing(false); 
		setEditingDriver(null); 
		setIsDeleting(false);
	};

	const handleConfirmDelete = async () => {
		try {
			const response = await fetch(`${apiUrl}/delete-driver`, {
				method: "POST",
				headers: {
				"Content-Type": "application/json",
				},
				body: JSON.stringify({
				driverId: editingDriver.driverId,
				}),
			});

			if (response.ok) {
				const updatedDrivers = drivers.filter(el => el.driverId !== editingDriver.driverId);

				setDrivers(updatedDrivers);
				setIsEditing(false); // Close the edit mode
				setEditingDriver(null); // Clear the editing van
				setIsDeleting(false);
			} else {
				console.error("Error deleting driver details");
			}
		} catch (error) {
			console.error("Error deleting driver:", error);
		}

	}

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView>
				<Text style={styles.heading}>View Your Drivers</Text>
				<View style={styles.gridContainer}>
					{drivers.map((item) => (
					<View key={item.driverId} style={styles.driverCard}>
						<Text style={styles.driverDetails}>{item.firstName}</Text>
            <Text style={styles.driverDetails}>{item.lastName}</Text>
						<FontAwesome5 name="user-circle" size={40} color="#b8ecce" />
						<Text style={styles.driverDetails}>{item.email}</Text>
            <Text style={styles.driverDetails}>Validated account? {item.isActive ? 'Yes' : 'No'}</Text>

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
					<Text style={styles.text}>First Name</Text>
					<Controller
						control={control}
						name="firstName"
						render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							ref={firstNameRef}
							onSubmitEditing={() => lastNameRef.current?.focus()}
							returnKeyType="next"
							style={styles.input}
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							blurOnSubmit={false}
						/>
						)}
					/>
					{errors.firstName && <Text style={styles.error}>{errors.firstName.message}</Text>}

					<Text style={styles.text}>Last Name</Text>
					<Controller
						control={control}
						name="lastName"
						render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							ref={lastNameRef}
              onSubmitEditing={() => emailRef.current?.focus()}
							returnKeyType="next"
							style={styles.input}
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							blurOnSubmit={false}
						/>
						)}
					/>
					{errors.lastName && <Text style={styles.error}>{errors.lastName.message}</Text>}

          <Text style={styles.text}>Email</Text>
					<Controller
						control={control}
						name="email"
						render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							ref={emailRef}
							returnKeyType="done"
							style={styles.input}
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							blurOnSubmit={false}
						/>
						)}
					/>
					{errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

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
						<Text>Are you sure you want to delete {editedFirstName} {editedLastName}?</Text>
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
					onPress={() => router.push("/(auth)/addDrivers")}
					style={({ pressed }) => [
					{
						backgroundColor: pressed ? '#eee060' : '#b8ecce',
					},
					styles.wrapperCustom,
					]}
				>
					<Text style={styles.pressable}>Add Driver</Text>
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
	driverCard: {
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
	driverDetails: {
		fontFamily: "AlfaSlabOne_400Regular",
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 5,
		textAlign: "center",
		color: "#3c6ca8",
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
