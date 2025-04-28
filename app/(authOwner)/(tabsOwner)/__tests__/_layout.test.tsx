import React from 'react';
import { render, screen } from '@testing-library/react-native';
import TabLayout from '../_layout';

jest.mock('expo-router', () => {
    const React = require('react');
    const { Text } = require('react-native');

    const Tabs = ({ children }: { children: React.ReactNode }) => <>{children}</>;
    Tabs.Screen = ({ name, options }: { name: string; options?: { title?: string; tabBarIcon?: any } }) => (
        <>
            <Text>{options?.title ?? name}</Text>
            {options?.tabBarIcon && options.tabBarIcon({ color: 'test-color', size: 20 })}
        </>
    );

    return { Tabs };
});

jest.mock('@expo/vector-icons/FontAwesome', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return ({ name, size, color }: { name: string; size: number; color: string }) => (
        <Text>{name}</Text>
    );
});

describe('TabLayout', () => {
    it('renders Home and Profile tabs with correct titles', () => {
        render(<TabLayout />);

        expect(screen.getByText('Home')).toBeTruthy();
        expect(screen.getByText('Profile')).toBeTruthy();
    });

    it('renders correct icons for each tab', () => {
        render(<TabLayout />);

        expect(screen.getByText('home')).toBeTruthy();
        expect(screen.getByText('gear')).toBeTruthy();
    });
});
