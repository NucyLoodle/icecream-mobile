import React, { ReactNode, createContext, useContext, useState } from "react";
import { useRouter } from "expo-router";
import config from "@/config";
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (data: { email: string; password: string }) => Promise<void>;
    logout: () => void;
}

async function saveToken(token: string) {
    await SecureStore.setItemAsync("userToken", token);
}



const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Login function (Redirect to Home)
  const login = async (data: { email: string, password: string }) => {

    // login logic

    console.log('submitting')
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
                console.log("Invalid credentials")
            }
          
          
      } catch (error: any) {
          console.log("Error", error.message);    
      }




  };



  // Logout function (Redirect to Auth Screen)
  const logout = () => {
    setIsAuthenticated(false);
    router.replace("/Login"); //  Redirect to login screen
  };
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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