import React, { useEffect, useState } from "react";
import { Text, Pressable, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import config from "@/config";
import { useRouter } from "expo-router";

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
	  
		socket.onopen = () => console.log("Connected to WebSocket");
		socket.onerror = (error) => console.error("WebSocket Error:", error);
		socket.onclose = () => console.log("Client disconnected");
	  
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
	  };
	  
	

	  const stopSharing = async () => {
		if (locationSubscription) {
		  locationSubscription.remove();
		  setLocationSubscription(null);
		}
	  
		if (ws) {
		  ws.close();
		  setWs(null);
		}
	  
		checkOutVan(vanId as string);
		console.log("Stopped sharing location.");
	  };
	  
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



  return (
    <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Van Tracking</Text>

        <Pressable
            onPress={startSharing}
            style={({pressed}) => [
				{
					backgroundColor: pressed ? '#b8ecce' : '#eee060',
				},
              	styles.wrapperCustom,
            ]}>         
            <Text style={styles.pressable}>Share My Location</Text>        
        </Pressable>

		<Pressable
            onPress={stopSharing}
            style={({pressed}) => [
				{
					backgroundColor: pressed ? '#b8ecce' : '#eee060',
				},
              	styles.wrapperCustom,
            ]}>         
            <Text style={styles.pressable}>Stop Sharing</Text>        
        </Pressable>

        {errorMsg ? <Text style={{ color: "red" }}>{errorMsg}</Text> : null}
        
		{location ? (
          	<Text style={styles.text}>Latitude: {location.coords.latitude}, Longitude: {location.coords.longitude}</Text>
        ) : (
          	<Text style={styles.text}>Location not available</Text>
        )}

    </SafeAreaView>
  );
};






export default TrackVan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eab2bb',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  heading: {
    color: '#3c6ca8',
    fontFamily: 'AlfaSlabOne_400Regular',
    fontSize: 20,
  },
  text: {
    color: '#3c6ca8',
    fontFamily: 'Poppins_400Regular',
    fontSize: 20,
  },
  pressable: {
    fontSize: 20,
    color: '#3e1755',
  },
  wrapperCustom: {
    borderRadius: 8,
    padding: 6,
  },
});
