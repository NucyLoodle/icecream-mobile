import React, { useEffect, useState } from "react";
import { View, Text, Alert, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking"

export default function Home() {
    // welcome page for logged out users
  const router = useRouter();
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  useEffect(() => {
    const handleDeepLink = (event: Linking.EventType) => {
      const url = event.url;
      const parsed = Linking.parse(url);
      if (parsed.queryParams?.token) {
        const token = parsed.queryParams.token as string;
        setInviteToken(token);
        Alert.alert("Invite Token Received", `Token: ${token}`);

        // Navigate to the verify screen and pass the token
        router.push({
          pathname: "/(public)/Verify",
          params: { token }, // Pass token as query param
        });
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Check if the app was opened via a deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (

    <View style={styles.container} >
		<Text style={styles.header}>Icecream Tracker</Text>
			<View style={styles.wrapper}>
				<Pressable
					onPress={() => router.push("/(public)/createInvite")}
					style={({pressed}) => [
						{
						backgroundColor: pressed ? '#eee060' : '#b8ecce',
						},
						styles.wrapperCustom,
					]}>         
					<Text style={styles.pressable}>Sign Up</Text>        
				</Pressable>

				<Pressable
					onPress={() => router.push({pathname: "/(public)/Verify", params: inviteToken ? { token: inviteToken } : undefined})}
					style={({pressed}) => [
						{
						backgroundColor: pressed ? '#eee060' : '#b8ecce',
						},
						styles.wrapperCustom,
					]}>         
					<Text style={styles.pressable}>Verify a Token</Text>        
				</Pressable>

				<Pressable
					onPress={() => router.push("/(public)/Login")}
					style={({pressed}) => [
						{
						backgroundColor: pressed ? '#eee060' : '#b8ecce',
						},
						styles.wrapperCustom,
					]}>         
					<Text style={styles.pressable}>Login</Text>        
				</Pressable>
			</View>
		<Text>Invite Token: {inviteToken ?? "No invite token yet"}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		// borderColor: "blue",
		// borderWidth: 3,
		backgroundColor: "#eab2bb",
		alignItems: "center",
		justifyContent: "space-between",
	},
	text: {
		color: "#3c6ca8",
		fontFamily: "AlfaSlabOne_400Regular",
	},
	header: {
		color: "#3c6ca8",
		fontFamily: "AlfaSlabOne_400Regular",
		fontSize: 30,
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
	wrapper: {
		// borderColor: "red",
		// borderWidth: 3,
		height: 250,
		justifyContent: "space-between",
	}
});
