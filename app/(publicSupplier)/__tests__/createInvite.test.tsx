import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, Alert } from 'react-native';
import SignUpCompany from '../createInvite';
import { getPressableStyle } from '../createInvite'; 

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

describe('SignUpCompany component', () => {
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
        const { getByText, getByLabelText } = render(<SignUpCompany />);
        fireEvent.changeText(getByLabelText('first name'), '');
        fireEvent.changeText(getByLabelText('last name'), '');
        fireEvent.changeText(getByLabelText('organization name'), '');
        fireEvent.changeText(getByLabelText('website'), '');
        fireEvent.changeText(getByLabelText('email'), '');
        fireEvent.changeText(getByLabelText('company number'), '0000000');
        fireEvent.changeText(getByLabelText('telephone'), '');
        fireEvent.changeText(getByLabelText('password'), 'Password!');
        fireEvent.changeText(getByLabelText('confirm password'), 'Password!');

        await waitFor(() => {
            expect(getByText('Your first name is required')).toBeTruthy();
            expect(getByText('Your surname is required')).toBeTruthy();
            expect(getByText('Company name is required')).toBeTruthy();
            expect(getByText('Invalid email address')).toBeTruthy();
            expect(getByText('Invalid telephone number')).toBeTruthy();
            expect(getByText('Contain at least one number.')).toBeTruthy();
            expect(getByText('Please enter a valid value')).toBeTruthy();
        });
    });
    

    it('shows password mismatch error', async () => {
        const { getByText, getByLabelText } = render(<SignUpCompany />);

        fireEvent.changeText(getByLabelText('first name'), 'Test');
        fireEvent.changeText(getByLabelText('last name'), 'Test');
        fireEvent.changeText(getByLabelText('organization name'), 'Test Company');
        fireEvent.changeText(getByLabelText('website'), 'www.test.com');
        fireEvent.changeText(getByLabelText('email'), 'test@test.com');
        fireEvent.changeText(getByLabelText('company number'), '00000000');
        fireEvent.changeText(getByLabelText('telephone'), '00000000000');
        fireEvent.changeText(getByLabelText('password'), 'Password1!');
        fireEvent.changeText(getByLabelText('confirm password'), 'Different1!');
        
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

        const { getByText, getByLabelText, queryByText } = render(<SignUpCompany />);

        fireEvent.changeText(getByLabelText('first name'), 'Test');
        fireEvent.changeText(getByLabelText('last name'), 'Test');
        fireEvent.changeText(getByLabelText('organization name'), 'Test Company');
        fireEvent.changeText(getByLabelText('website'), 'www.test.com');
        fireEvent.changeText(getByLabelText('email'), 'test@test.com');
        fireEvent.changeText(getByLabelText('company number'), '00000000');
        fireEvent.changeText(getByLabelText('telephone'), '00000000000');
        fireEvent.changeText(getByLabelText('password'), 'Password1!');
        fireEvent.changeText(getByLabelText('confirm password'), 'Password1!');
        
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Invite created! Check your email for your code.');
            expect(pushMock).toHaveBeenCalledWith('/(publicSupplier)/Home');
            expect(queryByText('Loading')).toBeNull();
        });
    });

    it('handles empty website', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
        });

        const { getByText, getByLabelText, queryByText } = render(<SignUpCompany />);

        fireEvent.changeText(getByLabelText('first name'), 'Test');
        fireEvent.changeText(getByLabelText('last name'), 'Test');
        fireEvent.changeText(getByLabelText('organization name'), 'Test Company');
        fireEvent.changeText(getByLabelText('email'), 'test@test.com');
        fireEvent.changeText(getByLabelText('company number'), '00000000');
        fireEvent.changeText(getByLabelText('telephone'), '00000000000');
        fireEvent.changeText(getByLabelText('password'), 'Password1!');
        fireEvent.changeText(getByLabelText('confirm password'), 'Password1!');
        
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Invite created! Check your email for your code.');
            expect(pushMock).toHaveBeenCalledWith('/(publicSupplier)/Home');
            expect(queryByText('Loading')).toBeNull();
        });
    });

    it('handles empty company number', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
        });

        const { getByText, getByLabelText, queryByText } = render(<SignUpCompany />);

        fireEvent.changeText(getByLabelText('first name'), 'Test');
        fireEvent.changeText(getByLabelText('last name'), 'Test');
        fireEvent.changeText(getByLabelText('organization name'), 'Test Company');
        fireEvent.changeText(getByLabelText('email'), 'test@test.com');
        fireEvent.changeText(getByLabelText('website'), 'www.test.com');
        fireEvent.changeText(getByLabelText('telephone'), '00000000000');
        fireEvent.changeText(getByLabelText('password'), 'Password1!');
        fireEvent.changeText(getByLabelText('confirm password'), 'Password1!');
        
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Invite created! Check your email for your code.');
            expect(pushMock).toHaveBeenCalledWith('/(publicSupplier)/Home');
            expect(queryByText('Loading')).toBeNull();
        });
    });

    it('shows failure alert on trying to sign up twice', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: 'Unused code' }),
        });

        const { getByText, getByLabelText } = render(<SignUpCompany />);

        fireEvent.changeText(getByLabelText('first name'), 'Test');
        fireEvent.changeText(getByLabelText('last name'), 'Test');
        fireEvent.changeText(getByLabelText('organization name'), 'Test Company');
        fireEvent.changeText(getByLabelText('website'), 'www.test.com');
        fireEvent.changeText(getByLabelText('email'), 'test@test.com');
        fireEvent.changeText(getByLabelText('company number'), '00000000');
        fireEvent.changeText(getByLabelText('telephone'), '00000000000');
        fireEvent.changeText(getByLabelText('password'), 'Password1!');
        fireEvent.changeText(getByLabelText('confirm password'), 'Password1!');
        
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Error',
                `You've already signed up. Check your email for your code.`
            );
        });
    });

    it('shows failure alert on trying to sign up when verification pending', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: 'Pending verification' }),
        });

        const { getByText, getByLabelText } = render(<SignUpCompany />);

        fireEvent.changeText(getByLabelText('first name'), 'Test');
        fireEvent.changeText(getByLabelText('last name'), 'Test');
        fireEvent.changeText(getByLabelText('organization name'), 'Test Company');
        fireEvent.changeText(getByLabelText('website'), 'www.test.com');
        fireEvent.changeText(getByLabelText('email'), 'test@test.com');
        fireEvent.changeText(getByLabelText('company number'), '00000000');
        fireEvent.changeText(getByLabelText('telephone'), '00000000000');
        fireEvent.changeText(getByLabelText('password'), 'Password1!');
        fireEvent.changeText(getByLabelText('confirm password'), 'Password1!');
        
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Error',
                `We are working on verifying you!`
            );
        });
    });

    it('shows failure alert on trying to sign up when account exists', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: 'Already registered' }),
        });

        const { getByText, getByLabelText } = render(<SignUpCompany />);

        fireEvent.changeText(getByLabelText('first name'), 'Test');
        fireEvent.changeText(getByLabelText('last name'), 'Test');
        fireEvent.changeText(getByLabelText('organization name'), 'Test Company');
        fireEvent.changeText(getByLabelText('website'), 'www.test.com');
        fireEvent.changeText(getByLabelText('email'), 'test@test.com');
        fireEvent.changeText(getByLabelText('company number'), '00000000');
        fireEvent.changeText(getByLabelText('telephone'), '00000000000');
        fireEvent.changeText(getByLabelText('password'), 'Password1!');
        fireEvent.changeText(getByLabelText('confirm password'), 'Password1!');
        
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Error',
                `You've already signed up. Did you forget your password?`
            );
        });
    });

    it('shows failure alert on trying to sign up when waiting on manual verification', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: 'Company needs to wait for manual verification' }),
        });

        const { getByText, getByLabelText } = render(<SignUpCompany />);

        fireEvent.changeText(getByLabelText('first name'), 'Test');
        fireEvent.changeText(getByLabelText('last name'), 'Test');
        fireEvent.changeText(getByLabelText('organization name'), 'Test Company');
        fireEvent.changeText(getByLabelText('website'), 'www.test.com');
        fireEvent.changeText(getByLabelText('email'), 'test@test.com');
        fireEvent.changeText(getByLabelText('company number'), '00000000');
        fireEvent.changeText(getByLabelText('telephone'), '00000000000');
        fireEvent.changeText(getByLabelText('password'), 'Password1!');
        fireEvent.changeText(getByLabelText('confirm password'), 'Password1!');
        
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Error',
                `Thanks for signing up. Unfortunately, we couldn't verify your company. We'll get back to you soon.`
            );
        });
    });

    it('toggles password visibility', async () => {
        const { getAllByText, getByLabelText } = render(<SignUpCompany />);
    
        const passwordInput = getByLabelText('password');
        const togglePasswordButtons = getAllByText('eye'); 
    
        expect(passwordInput.props.secureTextEntry).toBe(true);
        fireEvent.press(togglePasswordButtons[0]);  
        await waitFor(() => {
            expect(passwordInput.props.secureTextEntry).toBe(false);
        });
    });
    
    it('toggles confirm password visibility', async () => {
        const { getAllByText, getByLabelText } = render(<SignUpCompany />);

        const confirmPasswordInput = getByLabelText('confirm password');
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
