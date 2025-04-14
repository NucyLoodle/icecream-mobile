import React, { useEffect, useState } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";


const DisplayMap: React.FC = () => {
	const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
	const [error, setError] = useState<string | null>(null);
	const vans = useFindVans();
	const [selectedVan, setSelectedVan] = useState<Van | null>(null);


	type Van = {
		id: string;
		latitude: number;
		longitude: number;
	};
  
	function useFindVans() {
		const [vans, setVans] = useState<Van[]>([]);

		useEffect(() => {
		// Mock data for testing
			const mockVans = [
			{
				id: "test-van-1",
				latitude: 51.439330 + 0.001,
				longitude: -2.003884 + 0.001,
			},
			{
				id: "test-van-2",
				latitude: 51.439330 - 0.001,
				longitude: -2.003884 - 0.001,
			},
			{
				id: "test-van-3",
				latitude: 51.439330 + 0.002,
				longitude: -2.003884 - 0.0015,
			},
			];

			setVans(mockVans);
			const socket = new WebSocket("ws://localhost:8080");
		
			socket.onmessage = (event) => {
				const data = JSON.parse(event.data);
		
				if (data.type === "newLocation") {
					setVans((prevVans) => {
						const existingIndex = prevVans.findIndex((v) => v.id === data.van.id);
						if (existingIndex !== -1) {
							const updated = [...prevVans];
							updated[existingIndex] = data.van;
							return updated;
						}
						return [...prevVans, data.van];
					});
				}
		
				if (data.type === "removeVan") {
					setVans((prevVans) => prevVans.filter((van) => van.id !== data.vanId));
				}
			};
		
			return () => socket.close();
		}, []);
	
		return vans;
	}

	useEffect(() => {
		(async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				setError("Permission to access location was denied");
				return;
			}

			const location = await Location.getCurrentPositionAsync({});
			setUserLocation({
				lat: location.coords.latitude,
				lng: location.coords.longitude,
			});
		})();
	}, []);

	if (error) {
		return <Text style={styles.error}>{error}</Text>;
	}

	if (!userLocation) {
		return <ActivityIndicator size="large" color="#3c6ca8" />;
	}

	return (
		<SafeAreaView style={styles.container} >
			<View style={styles.mapContainer}>
				<MapView
					style={styles.map}
					provider={PROVIDER_GOOGLE}
					showsUserLocation
					initialRegion={{
						latitude: userLocation.lat,
						longitude: userLocation.lng,
						latitudeDelta: 0.01,
						longitudeDelta: 0.01,
					}}
				>
				{vans.map((van) => (
					<Marker
						key={van.id}
						coordinate={{
							latitude: van.latitude,
							longitude: van.longitude,
						}}
						title="Ice Cream Van 🍦"
						onPress={() => setSelectedVan(van)}
					>
						<Image
							source={require("@/assets/images/vanIcon.png")}
							style={{ width: 40, height: 40 }}
							resizeMode="contain"
						/>
					</Marker>
				))}
				</MapView>

					{selectedVan && (
						<View style={styles.infoPanel}>
							<Text style={styles.panelTitle}>Van ID: {selectedVan.id}</Text>
							<Text>Latitude: {selectedVan.latitude.toFixed(5)}</Text>
							<Text>Longitude: {selectedVan.longitude.toFixed(5)}</Text>
							<Text style={styles.closePanel} onPress={() => setSelectedVan(null)}>
								Close
							</Text>
						</View>
					)}
			</View>
		</SafeAreaView>
	);
};

export default DisplayMap;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#eab2bb",
	},
	mapContainer: {
		...StyleSheet.absoluteFillObject,
		height: '100%',
		width: '100%',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
	error: {
		color: "red",
		padding: 20,
		textAlign: "center",
	},
	infoPanel: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: 'white',
		padding: 20,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.2,
		shadowRadius: 5,
		elevation: 5,
	},
	panelTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	closePanel: {
		marginTop: 10,
		color: 'blue',
		textAlign: 'right',
	},
  
});
