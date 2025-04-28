import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, Alert } from 'react-native';
import CreatePassword from '../createPassword';
import { getPressableStyle } from '../createPassword'; 

jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn().mockReturnValue({ email: 'test@example.com', driverId: 'driver123' }),
    useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
}));

global.fetch = jest.fn();

jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
        MaterialCommunityIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
    };
});

jest.spyOn(Alert, 'alert');

describe('CreatePassword component', () => {
    const pushMock = require('expo-router').useRouter().push;

    beforeEach(() => {
        (fetch as jest.Mock).mockImplementation((url) => {     
            if (url.includes('/create-driver-password')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true }),
                    ok: true,
                });
            }

            return Promise.reject('Unknown endpoint');
        });

        jest.clearAllMocks();
    });

    it('shows validation errors for invalid inputs', async () => {
        const { getByText, getByPlaceholderText } = render(<CreatePassword />);
        fireEvent.changeText(getByPlaceholderText('Password'), 'A');
        fireEvent.changeText(getByPlaceholderText('Confirm password'), 'A');
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(getByText('Password must be at least 8 characters.')).toBeTruthy();
        });
    });

    it('shows confirmation mismatch error', async () => {
        const { getByPlaceholderText, getByText } = render(<CreatePassword />);

        fireEvent.changeText(getByPlaceholderText('Password'), 'Password1!');
        fireEvent.changeText(getByPlaceholderText('Confirm password'), 'Different1!');
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(getByText("Passwords don't match")).toBeTruthy();
        });
    });

    it('calls API and navigates on successful submit', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
        });

        const { getByPlaceholderText, getByText, queryByText } = render(<CreatePassword />);

        fireEvent.changeText(getByPlaceholderText('Password'), 'Pass123!');
        fireEvent.changeText(getByPlaceholderText('Confirm password'), 'Pass123!');
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Password created successfully!');
            expect(pushMock).toHaveBeenCalledWith('/(publicSupplier)/Login');
            expect(queryByText('Loading')).toBeNull();
        });
    });

    it('shows failure alert on API error', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: 'Bad things' }),
        });

        const { getByPlaceholderText, getByText } = render(<CreatePassword />);
        fireEvent.changeText(getByPlaceholderText('Password'), 'Pass123!');
        fireEvent.changeText(getByPlaceholderText('Confirm password'), 'Pass123!');
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Failed',
                'Password creation failed. Please try again.'
            );
        });
    });

    it('toggles password visibility', async () => {
        const { getAllByText, getByPlaceholderText } = render(<CreatePassword />);
    
        const passwordInput = getByPlaceholderText('Password');
        const togglePasswordButtons = getAllByText('eye'); 
    
        expect(passwordInput.props.secureTextEntry).toBe(true);
        fireEvent.press(togglePasswordButtons[0]);  
        await waitFor(() => {
            expect(passwordInput.props.secureTextEntry).toBe(false);
        });
    });
    
    it('toggles confirm password visibility', async () => {
        const { getAllByText, getByPlaceholderText } = render(<CreatePassword />);

        const confirmPasswordInput = getByPlaceholderText('Confirm password');
        const togglePasswordButtons = getAllByText('eye');

        expect(confirmPasswordInput.props.secureTextEntry).toBe(true);
        fireEvent.press(togglePasswordButtons[1]);

        await waitFor(() => {
            expect(confirmPasswordInput.props.secureTextEntry).toBe(false);
        });
    });

    it('applies the correct backgroundColor based on pressed state', () => {
        expect(getPressableStyle(true).backgroundColor).toBe('#b8ecce');
        expect(getPressableStyle(false).backgroundColor).toBe('#eab2bb');
    });

});
