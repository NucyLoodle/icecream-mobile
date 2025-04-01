// import '../gesture-handler';

// import React, { useCallback, useEffect, useState } from "react";
// import { Text, View, StyleSheet, Alert, Pressable } from "react-native";
// import { Link } from "expo-router";
// import {
//   useFonts,
//   AlfaSlabOne_400Regular,
// } from "@expo-google-fonts/alfa-slab-one";
// import * as SplashScreen from "expo-splash-screen";
// import { Poppins_400Regular } from "@expo-google-fonts/poppins";
// import * as Linking from "expo-linking";
// import { NavigationProp, useNavigation } from '@react-navigation/native';
// import * as SecureStore from 'expo-secure-store';

// // Import your AuthProvider

// import RootLayout from "../_layout";

// // Keep splash screen visible while loading resources
// SplashScreen.preventAutoHideAsync();

// // Set the animation options. This is optional.
// SplashScreen.setOptions({
//   duration: 1000,
//   fade: true,
// });

// type RootStackParamList = {
//   createInvite: undefined;
//   TrackVan: undefined;
//   Verify: { token: string | null };
//   Login: undefined,
// };

// export default function Index() {
//   const navigation = useNavigation<NavigationProp<RootStackParamList>>();

//   const [inviteToken, setInviteToken] = useState<string | null>(null);
//   const [fontsLoaded] = useFonts({
//     AlfaSlabOne_400Regular,
//     Poppins_400Regular,
//   });

//   useEffect(() => {
//     const handleDeepLink = (event: Linking.EventType) => {
//       const url = event.url;
//       const parsed = Linking.parse(url);
//       if (parsed.queryParams?.token) {
//         setInviteToken(parsed.queryParams.token as string);
//         Alert.alert("Invite Token Received", `Token: ${parsed.queryParams.token}`);
//       }
//     };


//     // Listen for deep links
//     const subscription = Linking.addEventListener("url", handleDeepLink);

//     // Check if the app was opened via link
//     Linking.getInitialURL().then((url) => {
//       if (url) handleDeepLink({ url });
//     });

//     return () => {
//       subscription.remove();
//     };
//   }, []); 

//   const onLayoutRootView = useCallback(async () => {
//     if (fontsLoaded) {
//       await SplashScreen.hideAsync();
//     }
//   }, [fontsLoaded]);

//   if (!fontsLoaded) {
//     return null; 
//   }

//   return (
//     <View style={styles.container} onLayout={onLayoutRootView}>
//       <Text style={styles.text}>Icecream Tracker</Text>

//       <Pressable
//         onPress={() => navigation.navigate('createInvite')}
//         style={({pressed}) => [
//           {
//             backgroundColor: pressed ? '#eee060' : '#b8ecce',
//           },
//           styles.wrapperCustom,
//         ]}>         
//         <Text style={styles.pressable}>Sign Up</Text>        
//       </Pressable>

//       <Pressable
//         onPress={() => navigation.navigate('Verify', { token: inviteToken })}
//         style={({pressed}) => [
//           {
//             backgroundColor: pressed ? '#eee060' : '#b8ecce',
//           },
//           styles.wrapperCustom,
//         ]}>         
//         <Text style={styles.pressable}>Verify a Token</Text>        
//       </Pressable>

//       <Pressable
//         onPress={() => navigation.navigate('Login')}
//         style={({pressed}) => [
//           {
//             backgroundColor: pressed ? '#eee060' : '#b8ecce',
//           },
//           styles.wrapperCustom,
//         ]}>         
//         <Text style={styles.pressable}>Login</Text>        
//       </Pressable>

//       <Pressable
//         onPress={() => navigation.navigate('TrackVan')}
//         style={({pressed}) => [
//           {
//             backgroundColor: pressed ? '#eee060' : '#b8ecce',
//           },
//           styles.wrapperCustom,
//         ]}>         
//         <Text style={styles.pressable}>Track Van</Text>        
//       </Pressable>
//       {/* <Link href="/TrackVan" style={styles.button}>Go to Track Van screen</Link> */}

//       <Text>Invite Token: {inviteToken ?? "No invite token yet"}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#eab2bb",
//     alignItems: "center",
//     justifyContent: "flex-start",
//   },
//   text: {
//     color: "#3c6ca8",
//     fontFamily: "AlfaSlabOne_400Regular",
//   },
//   button: {
//     fontSize: 20,
//     textDecorationLine: "underline",
//     color: "#fff",
//   },
//   pressable: {
//     fontSize: 20,
//     color: '#3e1755',
//     textAlign: 'center',
//   },
//   wrapperCustom: {
//     minWidth: 200,
//     borderRadius: 8,
//     padding: 6,   
//   }
// });

