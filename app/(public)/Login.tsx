import React, { useEffect, useState, useRef } from "react";
import { Text, TextInput, Alert, StyleSheet, Pressable, View } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from "@/context/AuthContext";

const verifySchema = z.object({
    email: z.string().email().nonempty(),
    password: z.string().nonempty(),
});

export default function Login() {
    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const { login } = useAuth();

    const {
        control,
        handleSubmit,setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(verifySchema),
    });

    const [showPassword, setShowPassword] = useState(false);  
    const toggleShowPassword = () => setShowPassword(!showPassword);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            await login(data);
        } catch (error: any) {
            Alert.alert("Login failed", "Please check your credentials and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>    
            <Text style={styles.heading}>Login</Text>

            <View style ={styles.formContainer}>  
                <View>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                            ref={emailRef}
                            onSubmitEditing={() => passwordRef.current?.focus()}
                            returnKeyType="next"
                            style={styles.input}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            placeholder="Email"
                            value={value}
                            />
                        )}
                    />
                    {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
                </View>
                <View>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                        <View style={styles.inputContainer}>
                        <TextInput
                            ref={passwordRef}
                            returnKeyType="done"
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
