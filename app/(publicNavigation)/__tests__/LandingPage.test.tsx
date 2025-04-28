import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LandingPage, { getPressableStyle } from '../LandingPage';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('expo-linking', () => ({
    addEventListener: jest.fn(),
    getInitialURL: jest.fn(),
    parse: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('LandingPage', () => {
    const mockPush = jest.fn();
    const mockReplace = jest.fn();
    let addEventListenerMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            replace: mockReplace,
        });
        addEventListenerMock = (Linking.addEventListener as jest.Mock).mockImplementation(() => ({
            remove: jest.fn(),
        }));
        (Linking.getInitialURL as jest.Mock).mockResolvedValue(null);
        (Linking.parse as jest.Mock).mockReturnValue({ queryParams: {} });
    });

    it('renders header and both buttons', () => {
        const { getByText } = render(<LandingPage />);
        expect(getByText('Icecream Tracker')).toBeTruthy();
        expect(getByText('Looking for Icecream?')).toBeTruthy();
        expect(getByText('Icecream Business? Click here!')).toBeTruthy();
    });

    it('applies correct background colors via getPressableStyle', () => {
        expect(getPressableStyle(true).backgroundColor).toBe('#b8ecce');
        expect(getPressableStyle(false).backgroundColor).toBe('#eab2bb');
    });

    it('navigates to users screen when "Looking for Icecream?" is pressed', () => {
        const { getByText } = render(<LandingPage />);
        fireEvent.press(getByText('Looking for Icecream?'));
        expect(mockPush).toHaveBeenCalledWith('/(users)');
    });

    it('navigates to supplier home when "Icecream Business? Click here!" is pressed', () => {
        const { getByText } = render(<LandingPage />);
        fireEvent.press(getByText('Icecream Business? Click here!'));
        expect(mockPush).toHaveBeenCalledWith({ pathname: '/(publicSupplier)/Home' });
    });

    it('handles a deep link via getInitialURL on mount', async () => {
        const deepLink = 'myapp://launch?token=abc123';
        (Linking.getInitialURL as jest.Mock).mockResolvedValue(deepLink);
        (Linking.parse as jest.Mock).mockReturnValue({ queryParams: { token: 'abc123' } });

        render(<LandingPage />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Invite Token Received',
                'Token: abc123'
            );
            expect(mockReplace).toHaveBeenCalledWith({
                pathname: '/(publicSupplier)/Verify',
                params: { token: 'abc123' },
            });
        });
    });

    it('handles a deep link via the event listener', async () => {
        let handler: (event: { url: string }) => void;
        addEventListenerMock.mockImplementation((_eventName, cb) => {
            handler = cb;
            return { remove: jest.fn() };
        });
        (Linking.getInitialURL as jest.Mock).mockResolvedValue(null);
        (Linking.parse as jest.Mock).mockReturnValue({ queryParams: { token: 'xyz789' } });

        render(<LandingPage />);
        handler!({ url: 'myapp://open?token=xyz789' });

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Invite Token Received',
                'Token: xyz789'
            );
            expect(mockReplace).toHaveBeenCalledWith({
                pathname: '/(publicSupplier)/Verify',
                params: { token: 'xyz789' },
            });
        });
    });

    it('does nothing when getInitialURL returns a URL without a token', async () => {
        (Linking.getInitialURL as jest.Mock).mockResolvedValue('myapp://open');
        (Linking.parse as jest.Mock).mockReturnValue({ queryParams: {} });
    
        render(<LandingPage />);

        await waitFor(() => {
            expect(Alert.alert).not.toHaveBeenCalled();
            expect(mockReplace).not.toHaveBeenCalled();
        });
    });
    
    it('does nothing when a deep-link event arrives without a token', async () => {
        let handler!: (event: { url: string }) => void;
        (Linking.addEventListener as jest.Mock).mockImplementation((_evt, cb) => {
            handler = cb;
            return { remove: jest.fn() };
        });
        (Linking.getInitialURL as jest.Mock).mockResolvedValue(null);
        (Linking.parse as jest.Mock).mockReturnValue({ queryParams: {} });
    
        render(<LandingPage />);
        handler({ url: 'myapp://open' });
    
        await waitFor(() => {
            expect(Alert.alert).not.toHaveBeenCalled();
            expect(mockReplace).not.toHaveBeenCalled();
        });
    });
});
