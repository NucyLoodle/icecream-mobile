import React, { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import config from "@/config";
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (data: { email: string; password: string }) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

async function saveToken(token: string) {
    await SecureStore.setItemAsync("userToken", token);
}

async function getToken() {
  return await SecureStore.getItemAsync("userToken");
}

async function removeToken() {
  await SecureStore.deleteItemAsync("userToken");
}



const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);
	const router = useRouter();


    // **Check authentication status on app load**
    useEffect(() => {
		const checkAuth = async () => {
			const token = await getToken();
			if (token) {
				setIsAuthenticated(true);
			}
			setLoading(false);
		};
		checkAuth();
    }, []);


  // Login function (Redirect to Home)
  	const login = async (data: { email: string, password: string }) => {
        const apiUrl = config.LocalHostAPI;
        if (!apiUrl) {
			console.error("API URL is not defined");
			return;
        }
    
        try {
          // const response = await fetch("https://icecream-web-one.vercel.app/api/log-in-companies", {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
          //   body: JSON.stringify(data),
          // });
			const response = await fetch(`${apiUrl}/log-in-companies`, {
				method: "POST",
				headers: {
				"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
			const result = await response.json();
				if (response.ok) {
					await saveToken(result.token);
					setIsAuthenticated(true);
					router.replace("/(auth)/(tabs)"); // Redirect to home tab
				} else {
					throw new Error(result.message || "Invalid credentials")
				}         
		} catch (error: any) {
			console.log("Error", error.message);
			throw error    
		}
  	};



  // Logout function (Redirect to Auth Screen)
	const logout = async () => {
		await removeToken();
		setIsAuthenticated(false);
		router.replace("/(public)/Home"); //  Redirect to home screen
	};

	return (
		<AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
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