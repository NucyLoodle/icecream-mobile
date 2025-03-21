import React, { useEffect } from "react";
import { Text, TextInput, Button, Alert, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// user enters token, or token is passed from deep link
// user clicks submit
// app sends token to server
// server responds with confirmation of verification and user data - firstName, lastName, companyName
// app displays user data - 'thank you for verifying your email, firstName lastName from companyName'
// db deletes from sign_up_codes and pending_invitions and moves data to other tables
// user returned to home screen and is logged in

const verifySchema = z.object({
    token: z.string().nonempty(),
});

export default function Verify() {
    const route = useRoute();
    const { token } = route.params as { token?: string };

    const {
        control,
        handleSubmit,setValue,
        formState: { errors },
        } = useForm({
            defaultValues: {token: ""},
        resolver: zodResolver(verifySchema),
        });

        const Verify = async (data: { token: string }) => {

            useEffect(() => {
                if (token) {
                  setValue("token", token); // Prefill the field
                }
              }, [token, setValue]);

            try {
                const response = await fetch("https://icecream-web-one.vercel.app/api/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
                });
        
                const result = await response.json();

                if (response.ok) {
                        // If registration is successful, display the invite token
                        Alert.alert("Success", `Thank you for verifying your email, ${result.firstName} ${result.lastName} from ${result.companyName}`);
                    } else {
                        // If response is not OK, throw an error with the message returned from the API
                        throw new Error(result.error || "Failed to verify email");
                    }
            } catch (error: any) {

                Alert.alert("Error", error.message);
                    
            }
        };


    return(
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Verify Your Email</Text>

                <Text style={styles.text}>Enter your token</Text>
                <Controller
                control={control}
                name="token"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    />
                )}
                />
                {errors.token && <Text style={styles.error}>{errors.token.message}</Text>}

                <Pressable
                    onPress={handleSubmit(Verify)}
                    style={({pressed}) => [
                    {
                        backgroundColor: pressed ? '#eee060' : '#b8ecce',
                    },
                    styles.wrapperCustom,
                    ]}>         
                    <Text style={styles.pressable}>Submit</Text>        
                </Pressable>


        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
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
      height: 40,
      minWidth: 200,
      maxWidth: '100%',
      backgroundColor: '#eee060',
      marginBottom: 10,
      paddingHorizontal: 8,
      fontFamily: "Poppins_400Regular",
      borderRadius: 10,
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