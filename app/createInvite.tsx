import React, { useEffect, useState } from "react";
import { Text, Pressable, Alert, StyleSheet } from "react-native";
import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import postgres from 'postgres';

export default function signUpCompany() {

    if (!process.env.POSTGRES_URL) {
        throw new Error('POSTGRES_URL is not defined');
    }
    const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });
    
    
    interface Invite {
        email: string;
        inviteToken: string;
        companyid: string;
        expiresAt: string;
    }
    
    async function createInvite(email: string): Promise<void> {
        const inviteToken: string = crypto.randomUUID();
        const companyid: string = crypto.randomUUID();
        const expiresAt: string = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Expires in 7 days
    
        await sql`
            INSERT INTO sign_up_codes (company_id, email, sign_up_token, expires_at)
            VALUES (${companyid}, ${email}, ${inviteToken}, ${expiresAt})
        `;
    }



    return (
        <SafeAreaView style={styles.container}>
                <Text style={styles.heading}>Van Tracking</Text>
        
                
        
            </SafeAreaView>
    )
}

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

