// import React, { useState, useEffect, useCallback } from "react";
// import "expo-dev-client";
// import { createStackNavigator } from "@react-navigation/stack";
// import Index from "./auth/index";
// import CreateInvite from "./createInvite";
// import TrackVan from "./TrackVan";
// import Verify from "./Verify";
// import Login from "./Login";
// import * as SecureStore from "expo-secure-store";
// import * as SplashScreen from "expo-splash-screen";


// const Stack = createStackNavigator();

// // Prevent the splash screen from auto-hiding
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   // const [isSignedIn, setIsSignedIn] = useState<null | boolean>(null);
  
//   // useEffect(() => {
//   //   async function checkAuthStatus() {
//   //     const token = await SecureStore.getItemAsync("userToken");
//   //     setIsSignedIn(!!token);
//   //     console.log("The user is signed in:" + isSignedIn + " here's the token:" + token)
//   //   }
//   //   checkAuthStatus();
//   // }, []);

//   // const onLayoutRootView = useCallback(async () => {
//   //   if (isSignedIn !== null) {
//   //     // Only hide splash screen once authentication check is done
//   //     await SplashScreen.hideAsync();
//   //   }
//   // }, [isSignedIn]);

//   // useEffect(() => {
//   //   onLayoutRootView();
//   // }, [isSignedIn]);

//   // if (isSignedIn === null) {
//   //   // Don't return anything, just keep the splash screen visible
//   //   return null;
//   // }

//   return (

//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="index" component={Index} />
        

//             <Stack.Screen name="TrackVan" component={TrackVan} />

//             <Stack.Screen name="createInvite" component={CreateInvite} />
//             <Stack.Screen name="Verify" component={Verify} />
//             <Stack.Screen name="Login" component={Login} />

//       </Stack.Navigator>
//   );
// }
