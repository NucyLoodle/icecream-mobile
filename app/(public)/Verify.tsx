import React, { useEffect, useState } from "react";
import { Text, TextInput, Alert, StyleSheet, Pressable, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import config from "@/config";
import { useRouter, useLocalSearchParams } from "expo-router";


 

// user enters token, or token is passed from deep link
// user clicks submit
// app sends token to server
// server responds with confirmation of verification and user data - firstName, lastName, companyName
// app displays user data - 'thank you for verifying your email, firstName lastName from companyName'
// db deletes from sign_up_codes and pending_invitions and moves data to other tables
// user returned to home screen and is logged in

const verifySchema = z.object({
    token: z.string().nonempty(),
    email: z.string().email().nonempty().transform((val) => val.toLowerCase()),
});

export default function Verify() {
    const router = useRouter();
    const { token } = useLocalSearchParams();

    const {
        control,
        handleSubmit,setValue,
        formState: { errors },
        } = useForm({
            defaultValues: {token: typeof token === "string" ? token : ""}, // ensure token is a string
        resolver: zodResolver(verifySchema),
        });
    
    const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Token from route params:", token);
    if (token) {
      setValue('token', typeof token === "string" ? token : ""); // ensure token is a string
    }
  }, [token, setValue]);



  const onSubmit = async (data: { token: string, email: string }) => {
    setLoading(true);
    console.log("Submitting token:", data); // Debugging line   
    
    const apiUrl = config.LocalHostAPI;
    if (!apiUrl) {
      console.error("API URL is not defined");
      return;
    }

    try {

      console.log("API URL:", apiUrl);
      const response = await fetch(`${apiUrl}/verify-token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        });

      


        // const response = await fetch("https://icecream-web-one.vercel.app/api/verify-token", {
        // method: "POST",
        // headers: {
        //     "Content-Type": "application/json",
        // },
        // body: JSON.stringify(data),
        // });

        const result = await response.json();

        if (response.ok) {
                // If registration is successful, display the invite token
                Alert.alert("Success", `Thank you for verifying your email, ${result.firstName} ${result.lastName} from ${result.companyName}`);
                router.push("/(public)/Login")
            } else {
                // If response is not OK, throw an error with the message returned from the API
                throw new Error(result.error || "Failed to verify email");
            }
      } catch (error: any) {

          Alert.alert("Error", error.message);
              
      } finally {
          setLoading(false);
      }
  };


    return(
        <SafeAreaView style={styles.container}>
            <Text>Invite Token: {token ?? "No invite token yet"}</Text>
            <Text style={styles.heading}>Verify Your Email</Text>

                <Text style={styles.text}>Enter your email</Text>
                <Controller
                control={control}
                name="email"
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
    )
}


const styles = StyleSheet.create({
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