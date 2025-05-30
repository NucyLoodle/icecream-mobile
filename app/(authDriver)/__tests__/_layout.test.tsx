import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Redirect } from 'expo-router';
import AuthDriverLayout from '../_layout';

jest.mock('@/context/AuthContext', () => ({
    useAuth: jest.fn(),
}));


jest.mock('expo-router', () => {
    const React = require('react');
    const { Text } = require('react-native');

    const Stack = ({ children }: { children: React.ReactNode }) => <>{children}</>;

    Stack.Screen = ({
        name,
        options,
    }: {
        name: string;
        options?: { title?: string; [key: string]: any };
    }) => <Text>{options?.title ?? name}</Text>;

    const Redirect = jest.fn((props: { href: string }) => null);

    return {
        __esModule: true,
        Redirect,
        Stack,
    };
});

describe('AuthSharedLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should redirect to LandingPage if not authenticated driver', () => {
        require('@/context/AuthContext').useAuth.mockReturnValue({ isAuthenticatedDriver: false });

        render(
        <NavigationContainer>
            <AuthDriverLayout />
        </NavigationContainer>
        );

        expect(Redirect).toHaveBeenCalledTimes(1);
        expect(Redirect).toHaveBeenCalledWith(
            expect.objectContaining({ href: '/(publicNavigation)/LandingPage' }),
            {}
        );
    });

    it('should render the Stack screens if authenticated', () => {
        require('@/context/AuthContext').useAuth.mockReturnValue({ isAuthenticatedDriver: true });

        render(
        <NavigationContainer>
            <AuthDriverLayout />
        </NavigationContainer>
        );

        expect(screen.getByText('index')).toBeTruthy();
        
    });
});
