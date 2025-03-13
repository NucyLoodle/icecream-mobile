import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Alert, StyleSheet } from "react-native";
import * as Location from "expo-location";
import endpoint from '../endpoints.config';

import {
  Poppins_400Regular,
}  from "@expo-google-fonts/poppins";

import {
  useFonts,
  AlfaSlabOne_400Regular,
} from "@expo-google-fonts/alfa-slab-one";


const VAN_ID = "7ea291e4-4299-484d-b293-04f71929d5e7";

const TrackVan: React.FC = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket(endpoint.WebSocketUrl);

      socket.onopen = () => console.log("Connected to WebSocket");
      socket.onerror = (error) => console.error("WebSocket Error:", error);
      socket.onclose = () => console.log("WebSocket Disconnected");

      setWs(socket);
    };

    connectWebSocket();

    return () => {
      ws?.close();
    };
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      Alert.alert("Permission Denied", "Enable location services to track your van.");
      return false;
    }
    return true;
  };

  const startTracking = async () => {
    if (!(await requestLocationPermission())) return;
  
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Update every 10 meters
      },
      (newLocation) => {
        setLocation(newLocation);
  
        const payload = {
          vanId: VAN_ID,
          lat: newLocation.coords.latitude,
          lng: newLocation.coords.longitude,
        };
  
        console.log("Sending payload to WebSocket:", payload);

        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ vanId: VAN_ID, lat: newLocation.coords.latitude, lng: newLocation.coords.longitude }));
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Van Tracking</Text>

      <Pressable
          onPress={startTracking}
          style={({pressed}) => [
            {
              backgroundColor: pressed ? '#b8ecce' : '#eee060',
            },
            styles.wrapperCustom,
          ]}>         
          <Text style={styles.pressable}>Share Location</Text>        
      </Pressable>

      {errorMsg ? <Text style={{ color: "red" }}>{errorMsg}</Text> : null}
      {location ? (
        <Text>Latitude: {location.coords.latitude}, Longitude: {location.coords.longitude}</Text>
      ) : (
        <Text>Location not available</Text>
      )}

      

    </View>
  );
};






export default TrackVan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eab2bb',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
