import React, { useEffect, useState } from "react";
import { Text, TextInput, Pressable, Alert, StyleSheet, Button } from "react-native";
import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";



const schema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
  });



export default function signUpCompany() {

    const {
        control,
        handleSubmit,
        formState: { errors },
      } = useForm({
        resolver: zodResolver(schema),
      });

    // Function to handle form submission
    const onSubmit = (data: { email: string }) => {
        console.log(data);

        
    };
    
    
    interface Invite {
        email: string;
        inviteToken: string;
        companyid: string;
        expiresAt: string;
    }
    
    



    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Sign Up</Text>

            <Text>Email</Text>
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter your email"
                />
                )}
            />
            {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
            
            <Button title="Submit" onPress={handleSubmit(onSubmit)} />
            
        
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eab2bb',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  heading: {
    color: '#3c6ca8',
    fontFamily: 'AlfaSlabOne_400Regular',
    fontSize: 20,
  },
  text: {
    color: '#3c6ca8',
    fontFamily: 'Poppins_400Regular',
    fontSize: 20,
  },
  pressable: {
    fontSize: 20,
    color: '#3e1755',
  },
  wrapperCustom: {
    borderRadius: 8,
    padding: 6,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  error: {
    color: "red",
  },
});

