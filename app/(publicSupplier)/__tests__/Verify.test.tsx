import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TextInput, Alert } from 'react-native';
import Verify from '../Verify';
import config from '@/config';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getPressableStyle } from '../Verify';

jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('Verify component', () => {
    const pushMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
        (useLocalSearchParams as jest.Mock).mockReturnValue({ token: 'abc123' });

        global.fetch = jest.fn();
    });


    it('renders invite token and form fields', () => {
        const { getByText,  } = render(<Verify />);
        expect(getByText('Invite Token: abc123')).toBeTruthy();
        expect(getByText('Verify Your Email')).toBeTruthy();
    });

    it('submits and navigates on owner role', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: () =>
                Promise.resolve({
                role: 'owner',
                firstName: 'John',
                lastName: 'Doe',
                companyName: 'Acme',
                }),
        });

        const { getByText, getByLabelText } = render(<Verify />);
        
        fireEvent.changeText(getByLabelText('email'), 'test@test.com');
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Success',
                'Thank you for verifying your email, John Doe from Acme'
            );
            // first push for owner login
            expect(pushMock).toHaveBeenCalledWith('/(publicSupplier)/Login');
        });
    });

    it('submits and navigates on driver role', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: () =>
                Promise.resolve({
                role: 'driver',
                firstName: 'Jane',
                lastName: 'Smith',
                driverId: 'driver123',
            }),
        });

        const { getByText, getByLabelText } = render(<Verify />);
        fireEvent.changeText(getByLabelText('email'), 'test@test.com');
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Success',
                'Thank you for verifying your email, Jane Smith!'
            );
            expect(pushMock).toHaveBeenCalledWith({
                pathname: '../(preAuth)/createPassword',
                params: { email: 'test@test.com', driverId: 'driver123' },
            });
        });
    });

    it('alerts "Token expired" and navigates home', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: 'Token expired' }),
        });

        const { getByText, getByLabelText } = render(<Verify />); 
        fireEvent.changeText(getByLabelText('email'), 'test@test.com');
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Error',
                'Token expired. Please request a new token from your manager.'
            );
            expect(pushMock).toHaveBeenCalledWith('/(publicSupplier)/Home');
        });
    });

    it('alerts "Owner token expired" and navigates home', async () => {
        (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Owner token expired' }),
        });

        const { getByText, getByLabelText } = render(<Verify />);
        fireEvent.changeText(getByLabelText('email'), 'test@test.com');
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Error',
                'Token expired. Please contact us to request.'
            );
            expect(pushMock).toHaveBeenCalledWith('/(publicSupplier)/Home');
        });
    });

    it('alerts "Token already used or invalid" and navigates home', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: 'Token already used or invalid' }),
        });

        const { getByText, getByLabelText } = render(<Verify />);
        fireEvent.changeText(getByLabelText('email'), 'test@test.com');
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Error',
                'Token already used or invalid. Please contact your manager to request a new token.'
            );
            expect(pushMock).toHaveBeenCalledWith('/(publicSupplier)/Home');
        });
    });

    it('handles unexpected error and does not navigate', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({}),
        });

        const { getByText, getByLabelText } = render(<Verify />);
        fireEvent.changeText(getByLabelText('email'), 'test@test.com');
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to verify email');
            expect(pushMock).not.toHaveBeenCalled();
        });
    });

    it('logs error and returns early when API URL is not defined', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        config.LocalHostAPI = '';

        const { getByText, getByLabelText } = render(<Verify />);
        fireEvent.changeText(getByLabelText('email'), 'test@test.com');
        fireEvent.press(getByText('Submit'));

        await waitFor(() => {
            expect(errorSpy).toHaveBeenCalledWith('API URL is not defined');
            expect(global.fetch).not.toHaveBeenCalled();
            expect(pushMock).not.toHaveBeenCalled();
        });

        errorSpy.mockRestore();
    });

    it('shows fallback message when no token param is provided', () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({});
        const { getByText } = render(<Verify />);
        expect(getByText('Invite Token: No invite token yet')).toBeTruthy();
    });

    it('applies the correct backgroundColor based on pressed state', () => {
            expect(getPressableStyle(true).backgroundColor).toBe('#b8ecce');
            expect(getPressableStyle(false).backgroundColor).toBe('#eab2bb');
    });
           
});
