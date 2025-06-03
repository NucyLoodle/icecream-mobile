import React, { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import config from "@/config";
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
    isAuthenticatedDriver: boolean;
	isAuthenticatedOwner: boolean;
    login: (data: { email: string; password: string }) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

async function saveOwnerDetails(token: string, ownerFirstName: string, ownerSurname: string, companyId: string, role: string) {
    await SecureStore.setItemAsync("userToken", token);
	await SecureStore.setItemAsync("firstName", ownerFirstName);
	await SecureStore.setItemAsync("surname", ownerSurname)
	await SecureStore.setItemAsync("companyId", companyId)
	await SecureStore.setItemAsync("role", role)
}

async function saveDriverDetails(token: string, driverFirstName: string, driverSurname: string, driverId: string, companyId: string, role: string) {
    await SecureStore.setItemAsync("userToken", token);
	await SecureStore.setItemAsync("firstName", driverFirstName);
	await SecureStore.setItemAsync("surname", driverSurname)
	await SecureStore.setItemAsync("driverId", driverId)
	await SecureStore.setItemAsync("companyId", companyId)
	await SecureStore.setItemAsync("role", role)
}

async function getToken() {
 	return await SecureStore.getItemAsync("userToken");
}

async function getRole() {
	return await SecureStore.getItemAsync("role");
}

async function removeUserDetails() {
	await SecureStore.deleteItemAsync("userToken");
	await SecureStore.deleteItemAsync("firstName");
	await SecureStore.deleteItemAsync("surname");
	await SecureStore.deleteItemAsync("driverId")
	await SecureStore.deleteItemAsync("companyId")
	await SecureStore.deleteItemAsync("role")
}



const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [isAuthenticatedOwner, setIsAuthenticatedOwner] = useState(false);
	const [isAuthenticatedDriver, setIsAuthenticatedDriver] = useState(false);
	const [loading, setLoading] = useState(true);
	const router = useRouter();


    // **Check authentication status on app load**
    useEffect(() => {
		const checkAuth = async () => {
			const token = await getToken();
			const role = await getRole();
			// console.log(token)
			// console.log("the role is", role)
			if (token && role === 'owner') {
				setIsAuthenticatedOwner(true);
			}
			if (token && role === 'driver') {
				setIsAuthenticatedDriver(true);
			}
			setLoading(false);
		};
		checkAuth();
		
    }, []);


  // Login function (Redirect to Home)
  	const login = async (data: { email: string, password: string }) => {
        const apiUrl = config.LocalHostAPI;
        if (!apiUrl) {
			// console.error("API URL is not defined");
			return;
        }
    
        try {
			const response = await fetch(`${apiUrl}/log-in-companies`, {
				method: "POST",
				headers: {
				"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
			const result = await response.json();
			// check for role and redirect accordingly
			// console.log("the result is", result)
				if (response.ok) {
					if(result.role === 'owner') {
						await saveOwnerDetails(result.token, result.ownerFirstName, result.ownerSurname, result.companyId, result.role);
						setIsAuthenticatedOwner(true);
						router.replace("/(authOwner)/(tabsOwner)"); // Redirect to home tab
					}
					if (result.role === 'driver') {
						await saveDriverDetails(result.token, result.driverFirstName, result.driverSurname, result.driverId, result.companyId, result.role);
						setIsAuthenticatedDriver(true);
						router.replace("/(authDriver)"); // Redirect to home tab
					}

				} else {
					throw new Error(result.message || "Invalid credentials")
				}         
		} catch (error: any) {
			// console.log("Error", error.message);
			throw error    
		}
  	};



  // Logout function (Redirect to Auth Screen)
	const logout = async () => {
		await removeUserDetails();
		const token = await getToken();
		const role = await getRole();
		// console.log(token)
		// console.log("the role is", role)
		setIsAuthenticatedDriver(false);
		setIsAuthenticatedOwner(false);
		router.replace("/(publicSupplier)/Home"); //  Redirect to home screen
	};

	return (
		<AuthContext.Provider value={{ isAuthenticatedDriver, isAuthenticatedOwner, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

//  Hook to use authentication state
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};