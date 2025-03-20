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
  ownerFirstName: z.string()
                   .nonempty({ message: "Your first name is required" }),
  ownerSurname: z.string()
                 .nonempty({ message: "Your surname is required" }),
  companyName: z.string()
                .nonempty({ message: "Company name is required" })
                .min(2, { message: "Must be at least 2 characters" }),
  companyWebsite: z.string().url({ message: "Invalid URL" }), // edit to be optional
  companyNumber: z.string().min(8, { message: "Invalid company number" }), //edit to be optional
  email: z.string()
          .email({ message: "Invalid email address" })
          .nonempty({ message: "Email is required" }),
  telephone: z.string()
              .min(10, { message: "Invalid telephone number" })
              .nonempty({ message: "Telephone number is required" }),
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
  const onSubmit = async (data: any) => {
    console.log(data); //debugging statement
    try {
      const response = await fetch("https://icecream-web-one.vercel.app/api/sign-up-companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // If registration is successful, display the invite token
        Alert.alert("Success", `Invite created! Token: ${result.inviteToken}`);
      } else {
        // If response is not OK, throw an error with the message returned from the API
        throw new Error(result.error || "Failed to create invite");
      }
    } catch (error: any) {
        if (error.message === "Pending verification" || error.message === "Unused code") {
            Alert.alert("Error", "You've already signed up. Check your email for your code.");
          } else if (error.message === "Already registered") {
            Alert.alert("Error", "You've already signed up. Did you forget your password?"); //navigate to login page
          } else if (error.message === "Company needs to wait for manual verification") {
            Alert.alert("Error", "Thanks for signing up. Unfortunately, we couldn't verify your company. We'll get back to you soon.");
          } else {
            Alert.alert("Error", error.message);
          }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Sign Up</Text>
      <Text>Please provide as many details as possible as this will help us verify your company.</Text>

      <Text>First Name</Text>
      <Controller
        control={control}
        name="ownerFirstName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Enter your first name"
          />
        )}
      />
      {errors.ownerFirstName && <Text style={styles.error}>{errors.ownerFirstName.message}</Text>}

      <Text>Surname</Text>
      <Controller
        control={control}
        name="ownerSurname"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Enter your first name"
          />
        )}
      />
      {errors.ownerSurname && <Text style={styles.error}>{errors.ownerSurname.message}</Text>}

      <Text>Company Name</Text>
      <Controller
        control={control}
        name="companyName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Enter your company name"
          />
        )}
      />
      {errors.companyName && <Text style={styles.error}>{errors.companyName.message}</Text>}

      <Text>Company Website</Text>
      <Controller
        control={control}
        name="companyWebsite"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Enter your website"
          />
        )}
      />
      {errors.companyWebsite && <Text style={styles.error}>{errors.companyWebsite.message}</Text>}

      <Text>Company Number</Text>
      <Controller
        control={control}
        name="companyNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Enter your company number from Companies House"
          />
        )}
      />
      {errors.companyNumber && <Text style={styles.error}>{errors.companyNumber.message}</Text>}

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

      <Text>Telephone</Text>
      <Controller
        control={control}
        name="telephone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Enter your business telephone number"
          />
        )}
      />
      {errors.telephone && <Text style={styles.error}>{errors.telephone.message}</Text>}

      <Text>Password</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Enter your password"
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}


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
