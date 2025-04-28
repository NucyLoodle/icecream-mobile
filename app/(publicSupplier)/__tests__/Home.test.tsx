import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Home from '../Home';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider } from '@/context/AuthContext';
import { getPressableStyle } from '../Home';
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

describe('Home Component', () => {

    it('renders correctly', async () => {      
        const { getByText } = render(<Home />);
        await waitFor(() => {
            expect(getByText('Icecream Tracker')).toBeTruthy();
        });
    });

    it('applies the correct backgroundColor based on pressed state', () => {
        expect(getPressableStyle(true).backgroundColor).toBe('#b8ecce');
        expect(getPressableStyle(false).backgroundColor).toBe('#eab2bb');
    });	
    
    it('navigates to the sign up screen', async () => {   
        const { getByText } = render(<Home />);
        await waitFor(() => {
            expect(getByText('Icecream Tracker')).toBeTruthy();
        });

        fireEvent.press(getByText('Sign Up'));
    
        expect(mockPush).toHaveBeenCalledWith('/(publicSupplier)/createInvite');
    });

    it('navigates to the verify screen', async () => {   
        const { getByText } = render(<Home />);
        await waitFor(() => {
            expect(getByText('Icecream Tracker')).toBeTruthy();
        });

        fireEvent.press(getByText('Verify a Token'));
    
        expect(mockPush).toHaveBeenCalledWith('/(publicSupplier)/Verify');
    });

    it('navigates to the login screen', async () => {   
        const { getByText } = render(<Home />);
        await waitFor(() => {
            expect(getByText('Icecream Tracker')).toBeTruthy();
        });

        fireEvent.press(getByText('Login'));
    
        expect(mockPush).toHaveBeenCalledWith('/(publicSupplier)/Login');
    });
    

});