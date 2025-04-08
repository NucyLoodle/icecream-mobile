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


const schema = z.object({
	vanReg: z.string()
					.nonempty({ message: "Van registration required" })
					.min(2, { message: "Must be at least 2 characters" }),
	vanNickname: z.string()
					.optional(),
});


export default function AddVans() {
    const [id, setId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const vanRegRef = useRef<TextInput>(null);
    const vanNicknameRef = useRef<TextInput>(null);

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
        resolver: zodResolver(schema),
        mode: 'onChange'
    });

    const onSubmit = async (data: any) => {
		setLoading(true);
		if (!data.vanNickname) {
			data.vanNickname = null;
		}
		// console.log(data); //debugging statement

		if (!apiUrl) {
			console.error("API URL is not defined");
			return;
		}

		try {
		// const response = await fetch("https://icecream-web-one.vercel.app/api/add-vans", {
		//   method: "POST",
		//   headers: {
		//     "Content-Type": "application/json",
		//   },
		//   body: JSON.stringify(data),
		// });

			const response = await fetch(`${apiUrl}/add-vans`, {
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
				router.replace("/(auth)/(tabsOwner)");
                setTimeout(() => {
                router.push("/(auth)/viewVans");
                }, 100); 
			} else {
				throw new Error(result.error || "Failed to add van");
			}

		} catch (error: any) {
			if (error.message === "Already registered") {
				console.log("already registered")
				Alert.alert("Error", "This van is already registered"); 
			}
			
		} finally {
		    setLoading(false);	
		}
	};

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Add a Van</Text>
            <Text style={styles.text}>Please provide the van registration. A nickname is optional, but fun!</Text>

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
                
            {!loading? (
                <Pressable
                onPress={handleSubmit(onSubmit)}
                style={({pressed}) => [
                    {
                    backgroundColor: pressed ? '#eee060' : '#b8ecce',
                    },
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
