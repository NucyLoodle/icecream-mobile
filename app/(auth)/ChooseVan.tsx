import React, { useEffect, useState } from "react";
import { Text, Pressable, Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import config from "@/config";
import * as SecureStore from 'expo-secure-store';
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";



const ChooseVan = () => {
	const [vans, setVans] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [companyId, setCompanyId] = useState<string | null>(null);
	// Select van from registered vans
    const apiUrl = config.LocalHostAPI;
    const router = useRouter();
    

    useEffect(() => {
        async function getCompanyId() {
            const storedId = await SecureStore.getItemAsync("companyId");
            setCompanyId(storedId); 
        }
        getCompanyId();
    }, []); // Only run once when the component mounts

    useEffect(() => {
        if (companyId && apiUrl) {
            const fetchVans = async () => {
                try {
                    const response = await fetch(`${apiUrl}/view-vans`, {
                        method: "POST",
                        headers: {
                        "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ companyId: companyId }),
                    });

                    const data: any[] = await response.json();
                    setVans(data); // Store vans data after fetching
                } catch (error) {
                    console.error("Error fetching vans:", error);
                } finally {
                    setLoading(false); // Stop loading state after fetching
                }
            };

            fetchVans();
            } else {
                console.log("Waiting for companyId...");
            }
        }, [companyId, apiUrl]);

    const selectVan = async (van: any) => {
        console.log(van.van_id);
        try {
            const driverId = await SecureStore.getItemAsync("driverId");
			const response = await fetch(`${apiUrl}/choose-van`, {
				method: "POST",
				headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				vanId: van.van_id,
				driverId: driverId,
			}),
		  });

		  	const result = await response.json();
	  
			if (response.ok) {
                //direct to trackVan
                router.push({
					pathname: "/(auth)/TrackVan",
                    params: {
                        vanId: van.van_id,
                        driverId: driverId || "", 
                      },
                    });
            } else {
				throw new Error(result.error || "Please try again");
			}

        } catch (error: any) {
            Alert.alert("Error", "Sorry, there was an error. Please try again."); 
        }
    };


  return (
    <SafeAreaView style={styles.container}>
		<Text style={styles.heading}>Available Vans</Text>
		<View style={styles.gridContainer}>
			{Array.isArray(vans) && vans.filter(van => van.in_use === false).map((item) => (
			<View key={item.van_id} style={styles.vanCard}>
				<Text style={styles.vanNickname}>{item.van_nickname}</Text>
				<FontAwesome5 name="truck" size={40} color="#b8ecce" />
				<View style={styles.regPlate}>
				<Text style={styles.regPlateText}>{item.van_reg}</Text>
				</View>
				<View>
					<Pressable
						onPress={() => selectVan(item)}
						style={({pressed}) => [
							{
								backgroundColor: pressed ? '#b8ecce' : '#eab2bb',
							},
							styles.wrapperCustom,
						]}>         
						<Text style={styles.pressable}>Select</Text>        
					</Pressable>
				</View>
			</View>
			))}
		</View>
    </SafeAreaView>
  );
};






export default ChooseVan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eab2bb',
    alignItems: 'center',
    justifyContent: 'center',
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
vanCard: {
	width: '40%',
	alignItems: "center",
	justifyContent: "center",
	backgroundColor: "white",
	padding: 20,
	margin: 10,
	borderRadius: 10,
	shadowColor: "#000",
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.1,
	shadowRadius: 4,
	elevation: 3,
},
vanNickname: {
	fontFamily: "AlfaSlabOne_400Regular",
	fontSize: 16,
	fontWeight: "bold",
	marginBottom: 5,
	textAlign: "center",
	color: "#3c6ca8",
},
regPlate: {
	marginTop: 10,
    marginBottom: 10,
	backgroundColor: "#FFD700",
	paddingVertical: 2,
	paddingHorizontal: 15,
	borderRadius: 5,
	borderWidth: 2,
	borderColor: "#000",
	textAlign: "center",
	minWidth: 100,
	overflow: "hidden",

},
regPlateText: {
	fontSize: 14,
	fontWeight: "bold",
},
icon: {
	marginHorizontal: 10,
},
gridContainer: {
	flexDirection: "row",
	flexWrap: "wrap",
	justifyContent: "space-between",
},
});
