import React, { useEffect, useState, useRef } from "react";
import { Text, TextInput, Alert, StyleSheet, Pressable, View } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import config from "@/config";

const schema = z.object({
	password: z.string()
				.min(8, { message: 'Password must be at least 8 characters.' })
				.regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
				.regex(/[0-9]/, { message: 'Contain at least one number.' })
				.regex(/[^a-zA-Z0-9]/, {
					message: 'Contain at least one special character.',
				})
				.trim(),
	confirmPassword: z.string()
})
.superRefine((data, ctx) => {
	if (data.password !== data.confirmPassword) {
		ctx.addIssue({
		path: ['confirmPassword'],
		message: "Passwords don't match",
		code: z.ZodIssueCode.custom,
		});
	}
});

export default function createPassword() {
    const { email, driverId } = useLocalSearchParams();

    const passwordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);

    const {
        control,
        handleSubmit,setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: any) => {
        const router = useRouter();
        setLoading(true);
        const apiUrl = config.LocalHostAPI;
		if (!apiUrl) {
			console.error("API URL is not defined");
			return;
		}

		try {
		// const response = await fetch("https://icecream-web-one.vercel.app/api/sign-up-companies", {
		//   method: "POST",
		//   headers: {
		//     "Content-Type": "application/json",
		//   },
		//   body: JSON.stringify(data),
		// });

			const response = await fetch(`${apiUrl}/create-driver-password`, {
				method: "POST",
				headers: {
				"Content-Type": "application/json",
				},
                body: JSON.stringify({ ...data, driverId }),
			});


			const result = await response.json();
            if (response.ok) {
                Alert.alert("Success", `Passwrord created successfully!`);
                router.push("/(publicSupplier)/Login")

            } else {
                // If response is not OK, throw an error with the message returned from the API
                throw new Error(result.error || "Failed to save password");
            }
        } catch (error: any) {
            Alert.alert("Login failed", "Please check your credentials and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>    
            <Text style={styles.heading}>Create your Password</Text>

            <View style ={styles.formContainer}>  

                <View>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                        <View style={styles.inputContainer}>
                        <TextInput
                            ref={passwordRef}
                            returnKeyType="next"
                            style={styles.input}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            blurOnSubmit={false}
                            secureTextEntry={!showPassword}
                            placeholder="Password"
                        />
                        <Pressable onPress={toggleShowPassword} style={styles.iconContainer}>
                            <MaterialCommunityIcons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={24}
                            color="#aaa"
                            />
                        </Pressable>
                        </View>
                        )}
                    />
                    {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
                </View>
                <View>
                    <Text style={styles.text}>Confirm password</Text>
                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                        <View style={styles.inputContainer}>
                            <TextInput
                            ref={confirmPasswordRef}
                            returnKeyType="done"
                            style={styles.input}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            textContentType="newPassword"
                            autoComplete="new-password"
                            secureTextEntry={!showConfirmPassword}
                            />
                        <Pressable onPress={toggleShowConfirmPassword} style={styles.iconContainer}>
                            <MaterialCommunityIcons
                            name={showConfirmPassword ? 'eye-off' : 'eye'}
                            size={24}
                            color="#aaa"
                            />
                        </Pressable>
                        </View>
                        )}
                    />
                    {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}
                </View>

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
            </View>
        </SafeAreaView>
    );
}

    
const styles = StyleSheet.create({
    formContainer: {
        maxWidth: '100%',
        // borderColor: 'red',
        // borderWidth: 5,
        height: '20%',
        justifyContent: "space-between",
    },
    inputContainer: {
        height: 40,
        // borderColor: 'red',
        // borderWidth: 5,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eee060',
        borderRadius: 10,
        maxWidth: '100%',
      },
      iconContainer: {
        padding: 8,
      },
    button: {
        minWidth: 200,
        backgroundColor: "#b8ecce",
        borderRadius: 8,
    },
    container: {
        // borderColor: 'blue',
        // borderWidth: 5,
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
        height: 40,
        minWidth: 200,
        maxWidth: '100%',
        // borderColor: 'pink',
        // borderWidth: 5,
        backgroundColor: '#eee060',
        paddingHorizontal: 8,
        fontFamily: "Poppins_400Regular",
        borderRadius: 10,
        textAlignVertical: "center",
    },
    pressable: {
        fontSize: 20,
        color: '#3e1755',
        textAlign: 'center',
    },
    wrapperCustom: {
        minWidth: 200,
        borderRadius: 8,
        padding: 6,
    },
    error: {
        fontFamily: "Poppins_400Regular",
        color: "red",
    },
});
