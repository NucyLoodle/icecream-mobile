import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Redirect } from 'expo-router';
import PreAuthLayout from '../_layout';

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

describe('PreAuthLayoutLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should redirect to /(authOwner)/(tabsOwner) if authenticated owner', () => {
        require('@/context/AuthContext').useAuth.mockReturnValue({ isAuthenticatedOwner: true });

        render(
            <NavigationContainer>
                <PreAuthLayout />
            </NavigationContainer>
        );

        expect(Redirect).toHaveBeenCalledTimes(1);
        expect(Redirect).toHaveBeenCalledWith(
        expect.objectContaining({ href: '/(authOwner)/(tabsOwner)' }),
        {}
        );
    });

    it('should redirect to /(authDriver) if authenticated driver', () => {
        require('@/context/AuthContext').useAuth.mockReturnValue({ isAuthenticatedDriver: true });

        render(
            <NavigationContainer>
                <PreAuthLayout />
            </NavigationContainer>
        );

        expect(Redirect).toHaveBeenCalledTimes(1);
        expect(Redirect).toHaveBeenCalledWith(
        expect.objectContaining({ href: '/(authDriver)' }),
        {}
        );
    });

    it('should render the Stack screens if not authenticated', () => {
        require('@/context/AuthContext').useAuth.mockReturnValue({ isAuthenticatedOwner: false });
        require('@/context/AuthContext').useAuth.mockReturnValue({ isAuthenticatedDriver: false });

        render(
            <NavigationContainer>
                <PreAuthLayout />
            </NavigationContainer>
        );

        expect(screen.getByText('createPassword')).toBeTruthy();
        
    });

    it('returns null while loading', () => {   
        require('@/context/AuthContext').useAuth.mockReturnValue({ loading: true, isAuthenticatedOwner: false, isAuthenticatedDriver: false });
    
        const { toJSON } = render(<PreAuthLayout />);
        expect(toJSON()).toBeNull();
        expect(Redirect).not.toHaveBeenCalled();
    });
});
