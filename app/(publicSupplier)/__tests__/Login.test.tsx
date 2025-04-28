import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from '../Login';
import { useAuth } from '@/context/AuthContext';
import { Alert } from 'react-native';
import { TextInput } from 'react-native';
import { getPressableStyle } from '../Login'; 

jest.mock('@/context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
        MaterialCommunityIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
    };
});

describe('Login component', () => {
    const mockLogin = jest.fn();

    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({
            login: mockLogin,
        });
        jest.spyOn(TextInput.prototype, 'focus').mockImplementation(() => {});
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByLabelText, getByText } = render(<Login />);
        expect(getByLabelText('email')).toBeTruthy();
        expect(getByLabelText('password')).toBeTruthy();
        expect(getByText('Submit')).toBeTruthy();
    });

    it('submits valid form and calls login', async () => {
        const { getByPlaceholderText, getByText } = render(<Login />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });
    });

    it('shows error alert if login fails', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Login failed'));

        const { getByPlaceholderText, getByText } = render(<Login />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');

        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Login failed',
                'Please check your credentials and try again.'
            );
        });
    });

    it('toggles password visibility', async () => {
        const { getByText, getByLabelText } = render(<Login />);
    
        const passwordInput = getByLabelText('password');
        const togglePasswordButtons = getByText('eye'); 
    
        expect(passwordInput.props.secureTextEntry).toBe(true);
        fireEvent.press(togglePasswordButtons);  
        await waitFor(() => {
            expect(passwordInput.props.secureTextEntry).toBe(false);
        });
    });

    it('focuses password when you submit the email', () => {
        const { getByLabelText } = render(<Login />);
        fireEvent(getByLabelText('email'), 'submitEditing');
        expect(TextInput.prototype.focus).toHaveBeenCalledTimes(1);
    });

    it('applies the correct backgroundColor based on pressed state', () => {
        expect(getPressableStyle(true).backgroundColor).toBe('#b8ecce');
        expect(getPressableStyle(false).backgroundColor).toBe('#eab2bb');
    });

});
