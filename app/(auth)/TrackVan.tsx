import React, { useEffect, useState } from "react";
import { Text, Pressable, Alert, StyleSheet, BackHandler } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from "expo-location";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import config from "@/config";
import { useFocusEffect } from "@react-navigation/native";

// const VAN_ID = "7ea291e4-4299-484d-b293-04f71929d5e7";

const TrackVan: React.FC = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);

	const { vanId, driverId } = useLocalSearchParams();
	console.log("driverId:", driverId, "vanId:", vanId);
	const apiUrl = config.LocalHostAPI;
	const router = useRouter();

	const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
	const [isSharing, setIsSharing] = useState(false);


	const requestLocationPermission = async () => {
		const { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			setErrorMsg("Permission to access location was denied");
			Alert.alert("Permission Denied", "Enable location services to track your van.");
			return false;
		}
		return true;
	};

	const startSharing = async () => {
		if (!(await requestLocationPermission())) return;
	  
		const websocketUrl = config.WebSocketUrl;
		const socket = new WebSocket(websocketUrl);
	  
		// socket.onopen = () => console.log("Connected to WebSocket");
		// socket.onerror = (error) => console.error("WebSocket Error:", error);
		// socket.onclose = () => console.log("Client disconnected");
	  
		setWs(socket); // store the socket so we can access it in the location watcher or stopSharing
	  
		const subscription = await Location.watchPositionAsync(
		  {
			accuracy: Location.Accuracy.High,
			timeInterval: 5000,
			distanceInterval: 10,
		  },
		  (newLocation) => {
			setLocation(newLocation);
	  
			const payload = {
				type: "newLocation",
				vanId,
				lat: newLocation.coords.latitude,
				lng: newLocation.coords.longitude,
			};
	  
			console.log("Sending payload to WebSocket:", payload);
	  
			if (socket.readyState === WebSocket.OPEN) {
			  socket.send(JSON.stringify(payload));
			} else {
			  console.warn("WebSocket is not open, cannot send payload.");
			}
		  }
		);
	  
		setLocationSubscription(subscription);
		setIsSharing(true);

	  };
	  
	

	  const stopSharing = async () => {
		if (locationSubscription) {
		  locationSubscription.remove();
		  setLocationSubscription(null);
		  setIsSharing(false);
		}
	  
		if (ws) {
		  // Notify other clients that this van has stopped sharing
		  const payload = {
			vanId,
			type: "vanStopped", // Type of message indicating van has stopped
		  };
		  ws.send(JSON.stringify(payload)); // Send to server to broadcast to other clients
	  
		  ws.close(); // Close WebSocket after notifying
		  setWs(null);
		}
		console.log("Van ID being passed to checkOutVan:", vanId);
		checkOutVan(vanId as string);
		console.log("Stopped sharing location.");
	  };
	  
	useFocusEffect(
		React.useCallback(() => {
			const onBackPress = () => {
			if (isSharing) {
				Alert.alert(
				"Still Sharing Location",
				"You’re still sharing your location. Would you like to stop sharing and go back?",
				[
					{ text: "Cancel", style: "cancel" },
					{
					text: "Stop Sharing & Go Back",
					style: "destructive",
					onPress: async () => {
						await stopSharing();
						router.back(); // Navigate back
					},
					},
				]
				);
				return true; // Block default back action
			}
			return false; // Allow default behavior
			};
		
			BackHandler.addEventListener("hardwareBackPress", onBackPress);
		
			return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
		}, [isSharing])
	);
	  
	  
	const checkOutVan = async (vanId : string) => {
		try {
			const response = await fetch(`${apiUrl}/checkout-van`, {
				method: "POST",
				headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				vanId
				}),
			});

			const result = await response.json();
		
			if (response.ok) {
				//direct to trackVan
				router.push({
					pathname: "/(authDriver)"});
			} else {
				throw new Error(result.error || "Please try again");
			}

		} catch (error: any) {
			Alert.alert("Error", "Sorry, there was an error. Please try again."); 
		}
	}

	useEffect(() => {
		return () => {
			console.log("Cleaning up on unmount...");
			stopSharing(); // stops tracking and closes WebSocket
		};
	  }, []);
	  


	return (
		<SafeAreaView style={styles.container}>
		  <Text style={styles.heading}>Van Tracking</Text>
	  	  
		  	<Pressable
				onPress={startSharing}
				disabled={isSharing}
				style={({ pressed }) => [
					styles.button,
					{
					backgroundColor: isSharing
						? '#ccc'
						: pressed
						? '#b8ecce'
						: '#eee060',
					},
				]}
			>
				<Text style={[styles.buttonText, isSharing && styles.disabledText]}>
					Share My Location
				</Text>
			</Pressable>

			<Pressable
				onPress={stopSharing}
				disabled={!isSharing}
				style={({ pressed }) => [
					styles.button,
					{
					backgroundColor: !isSharing
						? '#ccc'
						: pressed
						? '#b8ecce'
						: '#eee060',
					},
				]}
			>
				<Text style={[styles.buttonText, !isSharing && styles.disabledText]}>
					Stop Sharing
				</Text>
			</Pressable>

	  
		  {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
	  
		  <Text style={styles.locationText}>
			{location
			  ? `Latitude: ${location.coords.latitude.toFixed(4)}\nLongitude: ${location.coords.longitude.toFixed(4)}`
			  : 'Location not available'}
		  </Text>
		</SafeAreaView>
	  );
	  
	}





export default TrackVan;

const styles = StyleSheet.create({
	container: {
	  flex: 1,
	  backgroundColor: '#eab2bb',
	  alignItems: 'center',
	  justifyContent: 'center',
	  paddingHorizontal: 20,
	},
	heading: {
	  color: '#3c6ca8',
	  fontFamily: 'AlfaSlabOne_400Regular',
	  fontSize: 26,
	  marginBottom: 10,
	},
	subheading: {
	  color: '#3c6ca8',
	  fontFamily: 'Poppins_400Regular',
	  fontSize: 16,
	  marginBottom: 4,
	},
	button: {
	  borderRadius: 12,
	  paddingVertical: 14,
	  paddingHorizontal: 20,
	  marginVertical: 10,
	  width: '80%',
	  alignItems: 'center',
	  shadowColor: '#000',
	  shadowOffset: { width: 0, height: 1 },
	  shadowOpacity: 0.2,
	  shadowRadius: 1.41,
	  elevation: 2,
	},
	buttonText: {
	  fontSize: 18,
	  color: '#3e1755',
	  fontFamily: 'Poppins_400Regular',
	},
	locationText: {
	  color: '#3c6ca8',
	  fontFamily: 'Poppins_400Regular',
	  fontSize: 18,
	  marginTop: 30,
	  textAlign: 'center',
	},
	error: {
	  color: '#ff1e00',
	  fontSize: 16,
	  marginTop: 15,
	  textAlign: 'center',
	},
	disabledText: {
		color: '#888',
	},
  });
  
