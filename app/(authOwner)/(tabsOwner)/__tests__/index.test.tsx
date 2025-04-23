import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Index from '../index';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider } from '@/context/AuthContext';
import { getPressableStyle } from '../index';
import { useRouter } from 'expo-router'; 

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
}));

describe('Index Component', () => {

    it('renders correctly', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key) => {
            if (key === 'firstName') return 'Mr Frost';
            return null;
        });
          
        const { getByText } = render(
            <AuthProvider>
                <Index />
            </AuthProvider>);

        await waitFor(() => {
            expect(getByText('Welcome, Mr Frost!')).toBeTruthy();
        });
    });

    it('applies the correct backgroundColor based on pressed state', () => {
        expect(getPressableStyle(true).backgroundColor).toBe('#b8ecce');
        expect(getPressableStyle(false).backgroundColor).toBe('#eab2bb');
    });	
    
    it('navigates to ChooseVan screen when "Share my Location" is pressed', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key) => {
            if (key === 'firstName') return 'Mr Frost';
            return null;
        });
    
        const { getByText } = render(
            <AuthProvider>
                <Index />
            </AuthProvider>
        );
    
        await waitFor(() => {
            expect(getByText('Welcome, Mr Frost!')).toBeTruthy();
        });
    
        const shareButton = getByText('Share my Location');
    
        fireEvent.press(shareButton);
    
        expect(mockPush).toHaveBeenCalledWith('/(auth)/ChooseVan');
    });

    it('navigates to ViewVan screen when "View my Vans" is pressed', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key) => {
            if (key === 'firstName') return 'Mr Frost';
            return null;
        });
    
        const { getByText } = render(
            <AuthProvider>
                <Index />
            </AuthProvider>
        );
    
        await waitFor(() => {
            expect(getByText('Welcome, Mr Frost!')).toBeTruthy();
        });
    
        const shareButton = getByText('View my Vans');
    
        fireEvent.press(shareButton);
    
        expect(mockPush).toHaveBeenCalledWith('/(authOwner)/viewVans');
    });

    it('navigates to ViewDrivers screen when "View my Drivers" is pressed', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key) => {
            if (key === 'firstName') return 'Mr Frost';
            return null;
        });
    
        const { getByText } = render(
            <AuthProvider>
                <Index />
            </AuthProvider>
        );
    
        await waitFor(() => {
            expect(getByText('Welcome, Mr Frost!')).toBeTruthy();
        });
    
        const shareButton = getByText('View my Drivers');
    
        fireEvent.press(shareButton);
    
        expect(mockPush).toHaveBeenCalledWith('/(authOwner)/viewDrivers');
    });
    

});