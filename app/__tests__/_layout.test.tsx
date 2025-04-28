import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import RootLayout from '../_layout';

jest.mock('expo-splash-screen', () => ({
    preventAutoHideAsync: jest.fn(),
    setOptions: jest.fn(),
    hideAsync: jest.fn(),
}));


jest.mock('@expo-google-fonts/alfa-slab-one', () => ({
    useFonts: jest.fn(),
    AlfaSlabOne_400Regular: {},
}));

jest.mock('@expo-google-fonts/poppins', () => ({
    Poppins_400Regular: {},
}));

jest.mock('@/context/AuthContext', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('expo-router', () => {
    const React = require('react');
    const { Text } = require('react-native');

    const Stack: React.FC<{ children: React.ReactNode }> & {
        Screen: React.FC<{ name: string; options?: any }>;
    } = ({ children }) => <>{children}</>;
    Stack.Screen = ({ name }: { name: string }) => <Text>{name}</Text>;

    return {
        __esModule: true,
        Stack,
    };
});

describe('RootLayout', () => {
    const mockUseFonts = require('@expo-google-fonts/alfa-slab-one').useFonts as jest.Mock;
    const splash = require('expo-splash-screen');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns null while fonts are loading', () => {
        mockUseFonts.mockReturnValue([false]);

        const { toJSON } = render(<RootLayout />);
        expect(toJSON()).toBeNull();
        expect(splash.hideAsync).not.toHaveBeenCalled();
    });

    it('renders Stack screens and hides splash when fonts loaded', async () => {
        mockUseFonts.mockReturnValue([true]);

        const { getByText } = render(<RootLayout />);

        await waitFor(() => {
            expect(splash.hideAsync).toHaveBeenCalledTimes(1);
        });

        const screenNames = [
            '(users)',
            '(authOwner)',
            '(authDriver)',
            '(publicSupplier)',
            '(auth)',
            '(preAuth)',
            '(publicNavigation)',
        ];
        for (const name of screenNames) {
            expect(getByText(name)).toBeTruthy();
        }
    });
});
