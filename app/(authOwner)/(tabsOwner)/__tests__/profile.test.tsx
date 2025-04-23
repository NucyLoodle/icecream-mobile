import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Profile from '../profile';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
}));

global.fetch = jest.fn();

describe('Index Component', () => {

    beforeEach(() => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key) => {
            if (key === 'companyId') return 'mock-company-id';
            return null;
        });
    
        (fetch as jest.Mock).mockImplementation((url) => {
            if (url.includes('/view-profile')) {
                return Promise.resolve({
                    json: () =>
                    Promise.resolve([
                        {
                        company_name: 'Ice Scream',
                        email: 'mrfrost@icescream.com',
                        owner_first_name: 'Jack',
                        owner_surname: 'Frost',
                        url: 'https://icescream.com',
                        phone: '1234567890',
                        },
                    ]),
                    ok: true,
                });
            }
    
            return Promise.reject('Unknown endpoint');
        });
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    

    it('renders correctly', async () => {          
        const { getByText } = render(<Profile/>);

        await waitFor(() => {
            expect(getByText('Your Details')).toBeTruthy();
            expect(getByText('Company Name:')).toBeTruthy();
            expect(getByText('Ice Scream')).toBeTruthy();
            expect(getByText('Contact Email:')).toBeTruthy();
            expect(getByText('mrfrost@icescream.com')).toBeTruthy();
            expect(getByText('First Name:')).toBeTruthy();
            expect(getByText('Jack')).toBeTruthy();
            expect(getByText('Last Name:')).toBeTruthy();
            expect(getByText('Frost')).toBeTruthy();
            expect(getByText('Company Website:')).toBeTruthy();
            expect(getByText('https://icescream.com')).toBeTruthy();
            expect(getByText('Contact Phone:')).toBeTruthy();
            expect(getByText('1234567890')).toBeTruthy();
            expect(getByText('Contact us to update your info')).toBeTruthy();
        });
    });    

});