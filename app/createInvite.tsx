import React from "react";
import { Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";


// company sign up form
// company signs up with email, telephone, password, company name, company website, registered business number,
// company is queried to check if it already exists in the database
// if it does, an error message is displayed asking company to check email for verify code
// if it does not, Companies House API is queried to check if company exists
// if it does, company is added to the database and a verification email is sent
// if it does not, Google Places API is queried to check if company exists
// if it does, company is added to the database and a verification email is sent
// if it does not, an error message is displayed stating that the details cannot be verified at this time but it has been passed to an administrator
// company is added to the database with a status of pending verification


const schema = z.object({
  companyName: z.string()
                .nonempty({ message: "Company name is required" })
                .min(2, { message: "Must be at least 2 characters" }),
  companyWebsite: z.string().url({ message: "Invalid URL" }),
  companyNumber: z.string().min(8, { message: "Invalid company number" }),
  email: z.string().email({ message: "Invalid email address" }),
  telephone: z.string().min(10, { message: "Invalid telephone number" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export default function SignUpCompany() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Function to handle form submission
  const onSubmit = async (data: { email: string }) => {
    try {
      const response = await fetch("https://icecream-web-one.vercel.app/api/sign-up-companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create invite");
      }

      Alert.alert("Success", `Invite created! Token: ${result.inviteToken}`);
    } catch (error: any) {
        if (error.message === "Email already exists") {
            Alert.alert("Error", "You've already signed up. Check your email for your code.");
          } else {
            Alert.alert("Error", error.message);
          }
    }
  };

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eab2bb",
    alignItems: "center",
    justifyContent: "space-around",
  },
  heading: {
    color: "#3c6ca8",
    fontFamily: "AlfaSlabOne_400Regular",
    fontSize: 20,
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
