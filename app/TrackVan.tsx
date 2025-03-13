import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import * as Location from "expo-location";
import endpoint from '../endpoints.config';


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
    <View style={{ padding: 20 }}>
      <Text>Van Tracking</Text>
      {errorMsg ? <Text style={{ color: "red" }}>{errorMsg}</Text> : null}
      {location ? (
        <Text>Latitude: {location.coords.latitude}, Longitude: {location.coords.longitude}</Text>
      ) : (
        <Text>Location not available</Text>
      )}
      <Button title="Start Tracking" onPress={startTracking} />
    </View>
  );
};

export default TrackVan;
