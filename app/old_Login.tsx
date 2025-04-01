// import React, { useEffect, useState, useRef } from "react";
// import { Text, TextInput, Alert, StyleSheet, Pressable, View } from "react-native";
// import { Button } from "react-native-paper";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRoute } from "@react-navigation/native";
// import { useForm, Controller } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import {
//   createStaticNavigation,
//   useNavigation,
//   NavigationProp,
// } from '@react-navigation/native';
// import config from "../config";
// import * as SecureStore from 'expo-secure-store';




// type RootStackParamList = {
//   index: undefined;
//   TrackVan: undefined; // Add the TrackVan route here
//   // Add other routes here if needed
// };

// const verifySchema = z.object({
//     email: z.string().email().nonempty(),
//     password: z.string().nonempty(),
// });

// async function saveToken(token: string) {
//     await SecureStore.setItemAsync("userToken", token);
// }



// export default function Login() {
//       const emailRef = useRef<TextInput>(null);
//       const passwordRef = useRef<TextInput>(null);
//       const navigation = useNavigation<NavigationProp<RootStackParamList>>();


//     const {
//         control,
//         handleSubmit,setValue,
//         formState: { errors },
//         } = useForm({
//             //defaultValues: {token: token ?? ""}, // set the default value of the token field to the token passed from the deep link
//         resolver: zodResolver(verifySchema),
//         });

//     const [showPassword, setShowPassword] = useState(false);
    
//     const toggleShowPassword = () => setShowPassword(!showPassword);

//     const onSubmit = async (data: { email: string, password: string }) => {
//         //setLoading(true);
//         console.log('submitting')
//         const apiUrl = config.LocalHostAPI;
//         if (!apiUrl) {
//           console.error("API URL is not defined");
//           return;
//         }
    
//         try {
//           // const response = await fetch("https://icecream-web-one.vercel.app/api/log-in-companies", {
//           //   method: "POST",
//           //   headers: {
//           //     "Content-Type": "application/json",
//           //   },
//           //   body: JSON.stringify(data),
//           // });
    
//             const response = await fetch(`${apiUrl}/log-in-companies`, {
//                 method: "POST",
//                 headers: {
//                 "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify(data),
//             });
          
            
//             const result = await response.json();
//             if (response.ok) {

//                 Alert.alert("success")
//                 // await SecureStore.setItemAsync('userToken', 'test1')
//                 await saveToken(result.token);

//                 console.log()
//                 // let resultsecure = await SecureStore.getItemAsync('userToken');
//                 // console.log(result)
//                 // alert("🔐 Here's your value 🔐 \n" + resultsecure)
//                 navigation.navigate("TrackVan");
//             } else {
//                 Alert.alert("Invalid credentials")
//             }
            
            
//         } catch (error: any) {
//             Alert.alert("Error", error.message);

//         // navigation.navigate('dashboard')
//         // } finally {
//         //   setLoading(false);
          
//         }
//       };

//     return(
//         <SafeAreaView style={styles.container}>
            
//             <Text style={styles.heading}>Login</Text>

//             <View style ={styles.formContainer}>  
//                 <View>
//                     <Controller
//                         control={control}
//                         name="email"
//                         render={({ field: { onChange, onBlur, value } }) => (
//                             <TextInput
//                             ref={emailRef}
//                             onSubmitEditing={() => passwordRef.current?.focus()}
//                             returnKeyType="next"
//                             style={styles.input}
//                             onBlur={onBlur}
//                             onChangeText={onChange}
//                             placeholder="Email"
//                             value={value}
//                             />
//                         )}
//                     />
//                     {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
//                 </View>
//                 <View>
//                     <Controller
//                         control={control}
//                         name="password"
//                         render={({ field: { onChange, onBlur, value } }) => (
//                         <View style={styles.inputContainer}>
//                         <TextInput
//                             ref={passwordRef}
//                             returnKeyType="done"
//                             style={styles.input}
//                             onBlur={onBlur}
//                             onChangeText={onChange}
//                             value={value}
//                             blurOnSubmit={false}
//                             secureTextEntry={!showPassword}
//                             placeholder="Password"
//                         />
//                         <Pressable onPress={toggleShowPassword} style={styles.iconContainer}>
//                             <MaterialCommunityIcons
//                             name={showPassword ? 'eye-off' : 'eye'}
//                             size={24}
//                             color="#aaa"
//                             />
//                         </Pressable>
//                         </View>
//                         )}
//                     />
//                     {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
//                 </View>
//                 <Pressable
//                     onPress={handleSubmit(onSubmit)}
//                     style={({pressed}) => [
//                     {
//                         backgroundColor: pressed ? '#eee060' : '#b8ecce',
//                     },
//                     styles.wrapperCustom,
//                     ]}>         
//                     <Text style={styles.pressable}>Login</Text>        
//                 </Pressable>
//             </View>
//         </SafeAreaView>
//     )
// }
    
    
// const styles = StyleSheet.create({
//     formContainer: {
//         maxWidth: '100%',
//         // borderColor: 'red',
//         // borderWidth: 5,
//         height: '20%',

//         justifyContent: "space-between",
//     },
//     inputContainer: {
//         height: 40,
//         // borderColor: 'red',
//         // borderWidth: 5,
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#eee060',
//         borderRadius: 10,
//         maxWidth: '100%',
//         // paddingHorizontal: 10,
//         // marginBottom: 10, // Ensure consistent spacing
//       },
//     //   inputField: {
//     //     flex: 1, // Takes up available space
//     //     height: 50, // Ensures same height for both fields
//     //     fontFamily: "Poppins_400Regular",
//     //     paddingHorizontal: 8,
//     //   },
//       iconContainer: {
//         padding: 8,
//       },
//     button: {
//         minWidth: 200,
//         backgroundColor: "#b8ecce",
//         borderRadius: 8,
//         marginTop: 20,
//     },
//     container: {
//         // borderColor: 'blue',
//         // borderWidth: 5,
//         flex: 1,
//         backgroundColor: "#eab2bb",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: 5,
//     },
//     heading: {
//         color: "#3c6ca8",
//         fontFamily: "AlfaSlabOne_400Regular",
//         fontSize: 20,
//     },
//     text: {
//         fontFamily: "Poppins_400Regular",
//         color: '#3e1755'
//     },
//     input: {
//         height: 40,
//         minWidth: 200,
//         maxWidth: '100%',
//         // borderColor: 'pink',
//         // borderWidth: 5,
//         backgroundColor: '#eee060',
//         paddingHorizontal: 8,
//         fontFamily: "Poppins_400Regular",
//         borderRadius: 10,
//         textAlignVertical: "center",
//         // marginBottom: 5,

//     },
//     pressable: {
//         fontSize: 20,
//         color: '#3e1755',
//         textAlign: 'center',
//     },
//     wrapperCustom: {
//         minWidth: 200,
//         borderRadius: 8,
//         padding: 6,
//     },
//     error: {
//         fontFamily: "Poppins_400Regular",
//         color: "red",
//     },
// });
