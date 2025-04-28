import React, { useEffect, useState } from "react";
import { View, Text, Alert, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export const getPressableStyle = (pressed: boolean) => ({
	backgroundColor: pressed ? '#b8ecce' : '#eab2bb',
});

export default function Home() {
	const router = useRouter();

	return (

		<SafeAreaView style={styles.container} >
			<Text style={styles.header}>Icecream Tracker</Text>
				<View>
					<Pressable
						onPress={() => router.push("/(publicSupplier)/createInvite")}
						style={({pressed}) => [
						getPressableStyle(pressed),
						styles.wrapperCustom,
					]}>       
						<Text style={styles.pressable}>Sign Up</Text>        
					</Pressable>

					<Pressable
						// onPress={() => router.push({pathname: "/(publicSupplier)/Verify", params: inviteToken ? { token: inviteToken } : undefined})}
						onPress={() => router.push( "/(publicSupplier)/Verify")}
						style={({pressed}) => [
							getPressableStyle(pressed),
							styles.wrapperCustom,
						]}>            
						<Text style={styles.pressable}>Verify a Token</Text>        
					</Pressable>

					<Pressable
						onPress={() => router.push("/(publicSupplier)/Login")}
						style={({pressed}) => [
							getPressableStyle(pressed),
							styles.wrapperCustom,
						]}>            
						<Text style={styles.pressable}>Login</Text>        
					</Pressable>
				</View>
		</SafeAreaView>
	);
}


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
