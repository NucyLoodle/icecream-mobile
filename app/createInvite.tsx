import React, { useRef, useState } from "react";
import { Text, TextInput, Alert, StyleSheet, Pressable, ScrollView, View } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  createStaticNavigation,
  useNavigation,
  NavigationProp,
} from '@react-navigation/native';
import config from "../config";

type RootStackParamList = {
  index: undefined;
  // Add other routes here if needed
};


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
                   .nonempty({ message: "Your first name is required" })
                   .min(2, { message: "Must be at least 2 characters" }),
  ownerSurname: z.string()
                 .nonempty({ message: "Your surname is required" })
                 .min(2, { message: "Must be at least 2 characters" }),
  companyName: z.string()
                .nonempty({ message: "Company name is required" })
                .min(2, { message: "Must be at least 2 characters" }),
  companyWebsite: z.string().optional().or(z.literal('')).transform((companyWebsite) => companyWebsite ? companyWebsite.toLowerCase() : companyWebsite), // edit to be optional
  companyNumber: z.string()
                .min(8, "Please enter a valid value")
                .optional()
                .or(z.literal('')),
  email: z.string()
          .email({ message: "Invalid email address" })
          .nonempty({ message: "Email is required" })
          .transform((email) => email.toLowerCase()),
  telephone: z.string()
              .min(10, { message: "Invalid telephone number" })
              .nonempty({ message: "Telephone number is required" }),
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

export default function SignUpCompany() {
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const companyNameRef = useRef<TextInput>(null);
  const companyWebsiteRef = useRef<TextInput>(null);
  const companyNumberRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const telephoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange'
  });

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  // Function to handle form submission
  const onSubmit = async (data: any) => {
    setLoading(true);
    // if companyNumber is empty, set it to null
    if (!data.companyNumber) {
      data.companyNumber = null;
    }
    // if companyWebsite is empty, set it to null
    if (!data.companyWebsite) {
      data.companyWebsite = null;
    }
    console.log(data); //debugging statement

    const apiUrl = config.SignUpAPI;
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

      const response = await fetch(`${apiUrl}/sign-up-companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });


      const result = await response.json();

      if (response.ok) {
        // If registration is successful, display the invite token
        Alert.alert("Success", `Invite created! Check your email for your code.`);
        navigation.navigate('index')
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
    navigation.navigate('index')
    } finally {
      setLoading(false);
      
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <Text style={styles.heading}>Sign Up</Text>
      <Text style={styles.text}>Please provide as many details as possible as this will help us verify your company.</Text>

      <Text style={styles.text}>First Name</Text>
      <Controller
        control={control}
        name="ownerFirstName"
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
          />
        )}
      />
      {errors.ownerFirstName && <Text style={styles.error}>{errors.ownerFirstName.message}</Text>}

      <Text style={styles.text}>Surname</Text>
      <Controller
        control={control}
        name="ownerSurname"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            ref={lastNameRef}
            onSubmitEditing={() => companyNameRef.current?.focus()}
            returnKeyType="next"
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            blurOnSubmit={false}
            textContentType="familyName"
            autoComplete="family-name"
          />
        )}
      />
      {errors.ownerSurname && <Text style={styles.error}>{errors.ownerSurname.message}</Text>}

      <Text style={styles.text}>Company Name</Text>
      <Controller
        control={control}
        name="companyName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            ref={companyNameRef}
            onSubmitEditing={() => companyWebsiteRef.current?.focus()}
            returnKeyType="next"
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            blurOnSubmit={false}
            textContentType="organizationName"
            autoComplete="organization"
            
          />
        )}
      />
      {errors.companyName && <Text style={styles.error}>{errors.companyName.message}</Text>}

      <Text style={styles.text}>Company Website</Text>
      <Controller
        control={control}
        name="companyWebsite"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            ref={companyWebsiteRef}
            onSubmitEditing={() => companyNumberRef.current?.focus()}
            returnKeyType="next"
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            blurOnSubmit={false}
            textContentType="URL"
            autoComplete="url"
          />
        )}
      />
      {errors.companyWebsite && <Text style={styles.error}>{errors.companyWebsite.message}</Text>}

      <Text style={styles.text}>Company Number (from Companies House)</Text>
      
      <Controller
        control={control}
        name="companyNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            ref={companyNumberRef}
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
      {errors.companyNumber && <Text style={styles.error}>{errors.companyNumber.message}</Text>}

      <Text style={styles.text}>Email</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            ref={emailRef}
            onSubmitEditing={() => telephoneRef.current?.focus()} 
            returnKeyType="next"
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            blurOnSubmit={false}
            textContentType="emailAddress"
            autoComplete="email"

          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Text style={styles.text}>Telephone</Text>
      <Controller
        control={control}
        name="telephone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            ref={telephoneRef}
            onSubmitEditing={() => passwordRef.current?.focus()}
            returnKeyType="next"
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            blurOnSubmit={false}
            textContentType="telephoneNumber"
            autoComplete="tel"
          />
        )}
      />
      {errors.telephone && <Text style={styles.error}>{errors.telephone.message}</Text>}

      <Text style={styles.text}>Password</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
          <TextInput
            ref={passwordRef}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            returnKeyType="next"
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            blurOnSubmit={false}
            textContentType="newPassword"
            autoComplete="new-password"
            secureTextEntry={!showPassword}
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
      

      </ScrollView>
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
  iconContainer: {
    // position: 'absolute',
    // right: 10,
    // top: '50%',
    // transform: [{ translateY: -12 }], // Adjust to center the icon vertically
    padding: 8,
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
    justifyContent: "space-around",
    padding: 5,
  },
  heading: {
    color: "#3c6ca8",
    fontFamily: "AlfaSlabOne_400Regular",
    fontSize: 20,
  },
  // icon: {
  //   marginLeft: 10,
  // },  
  text: {
    fontFamily: "Poppins_400Regular",
    color: '#3e1755'
  },
  input: {
    flex: 1,
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
