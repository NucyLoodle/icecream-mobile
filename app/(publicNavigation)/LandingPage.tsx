import React, { useEffect, useState } from "react";
import { View, Text, Alert, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking"

export const getPressableStyle = (pressed: boolean) => ({
	backgroundColor: pressed ? '#b8ecce' : '#eab2bb',
});

export default function LandingPage() {
    const router = useRouter();
    const [inviteToken, setInviteToken] = useState<string | null>(null);

	useEffect(() => {
		const handleDeepLink = (event: { url: string }) => {
			const url = event.url;
			const parsed = Linking.parse(url);
			if (parsed.queryParams?.token) {
				const token = parsed.queryParams.token as string;
				setInviteToken(token);
				Alert.alert("Invite Token Received", `Token: ${token}`);
				router.replace({
					pathname: "/(publicSupplier)/Verify",
					params: { token },
				});
			}
		};
		
		const subscription = Linking.addEventListener("url", handleDeepLink);
		Linking.getInitialURL().then((url) => {
			if (url) handleDeepLink({ url });
		});
	
		return () => {
			subscription.remove();
		};
	}, []);


  	return (

    <SafeAreaView style={styles.container} >
        <Text style={styles.header}>Icecream Tracker</Text>
            <View>
                <Pressable
                    onPress={() => router.push("/(users)")}
                    style={({pressed}) => [
						getPressableStyle(pressed),
						styles.wrapperCustom,
                  ]}>         
                    <Text style={styles.pressable}>Looking for Icecream?</Text>        
                </Pressable>

                <Pressable
                    onPress={() => router.push({pathname: "/(publicSupplier)/Home"})}
                    style={({pressed}) => [
						getPressableStyle(pressed),
						styles.wrapperCustom,
                  ]}>        
                    <Text style={styles.pressable}>Icecream Business? Click here!</Text>        
                </Pressable>

            </View>
    </SafeAreaView>
)};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        // borderColor: "blue",
        // borderWidth: 3,
        backgroundColor: "#eab2bb",
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        color: "#3c6ca8",
        fontFamily: "AlfaSlabOne_400Regular",
    },
    header: {
        color: "#3c6ca8",
        fontFamily: "AlfaSlabOne_400Regular",
        fontSize: 30,
        marginBottom: 20,
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
        marginBottom: 20, 
    },

});
