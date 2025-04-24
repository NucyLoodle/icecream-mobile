import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import config from "@/config";
import * as SecureStore from 'expo-secure-store';
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";

export const getPressableStyle = (pressed: boolean) => ({
	backgroundColor: pressed ? '#b8ecce' : '#eab2bb',
});

const addDriverSchema = z.object({
    firstName: z.string().nonempty({ message: "Your first name is required" }).min(2, { message: "Must be at least 2 characters" }),
    lastName: z.string().nonempty({ message: "Your surname is required" }).min(2, { message: "Must be at least 2 characters" }),
    email: z.string().nonempty().email({ message: 'Please enter a valid email.' }).trim().transform((val) => val.toLowerCase()),
})


export default function AddDrivers() {
    const [id, setId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const firstNameRef = useRef<TextInput>(null);
    const lastNameRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);

    const apiUrl = config.LocalHostAPI;

    useEffect(() => {
        async function getCompanyId() {
            const storedId = await SecureStore.getItemAsync("companyId");
            setId(storedId); 
        }
        getCompanyId();
    }, []); // Only run once when the component mounts

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(addDriverSchema),
        mode: 'onChange'
    });

    const onSubmit = async (data: any) => {
		setLoading(true);
		// console.log(data); //debugging statement

		if (!apiUrl) {
			console.error("API URL is not defined");
			return;
		}

		try {
			const response = await fetch(`${apiUrl}/add-drivers`, {
				method: "POST",
				headers: {
				"Content-Type": "application/json",
				},
                body: JSON.stringify({
                    ...data,
                    companyId: id,
                }),
			});

			const result = await response.json();

			if (response.ok) {
				console.log("success")
				router.replace("/(authOwner)/(tabsOwner)");
                setTimeout(() => {
                router.push("/(authOwner)/viewDrivers");
                }, 100); 
			} else {
				throw new Error(result.error || "Failed to add driver");
			}

		} catch (error: any) {
			if (error.message === "Already registered") {
				console.log("already registered")
				Alert.alert("Error", "This driver is already registered"); 
			} else if (error.message === "Failed to send verification email.") {
                Alert.alert("Error", "Unfortunately, we weren't able to send a verification email. Please delete the driver and try again.")
            } else {
                Alert.alert("Error", "Sorry, there was an error during sign up. If it continues, please contact us.")
            }
			
		} finally {
		    setLoading(false);	
		}
	};

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Add a Driver</Text>
            <Text style={styles.text}>Please provide their email and full name. An invite link will be emailed to your driver.</Text>

            <Text style={styles.text}>First name</Text>
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
                    textContentType="givenName"
                    autoComplete="given-name"
                    accessibilityLabel="First name"
                />
                )}
            />
            {errors.firstName && <Text style={styles.error}>{errors.firstName.message}</Text>}	


            <Text style={styles.text}>Surname</Text>
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
                    textContentType="familyName"
                    autoComplete="family-name"
                    accessibilityLabel="surname"

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
                    textContentType="emailAddress"
                    autoComplete="email"
                    accessibilityLabel="email"

                />
                )}
            />
            {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
                
            {!loading? (
                <Pressable
                onPress={handleSubmit(onSubmit)}
                style={({pressed}) => [
                    getPressableStyle(pressed),
                    styles.wrapperCustom,
                ]}>           
                <Text style={styles.pressable}>Submit</Text>        
                </Pressable>
            ) : (
                <Button
                mode="contained"
                loading
                disabled
                style={styles.button}
                labelStyle={{ color: '#3e1755', fontSize: 15, fontFamily: "Poppins_400Regular" }}
                >
                Loading
                </Button>
            )}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	inputContainer: {
		flexDirection: 'row', // Ensure elements are in a row
		alignItems: 'center', // Align items vertically
		backgroundColor: '#eee060',
		borderRadius: 10,
		width: '100%', // Take full width of the parent
		paddingRight: 10, // Space for the icon
	},
	button: {
		minWidth: 200,
		backgroundColor: "#b8ecce",
		borderRadius: 8,
		marginTop: 20,
	},
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
		color: '#3e1755'
	},
	input: {
		// flex: 1,
		height: 40,
		minWidth: 200,
		maxWidth: '100%',
		backgroundColor: '#eee060',
		// marginBottom: 10,
		paddingHorizontal: 8,
		// paddingRight: 40,
		fontFamily: "Poppins_400Regular",
		borderRadius: 10,
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
	error: {
		fontFamily: "Poppins_400Regular",
		color: "red",
	},
});
