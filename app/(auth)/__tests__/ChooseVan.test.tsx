import React from 'react';
import 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ChooseVan from '../ChooseVan';
import { getVanCardStyle } from '../ChooseVan';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';


jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
}));

global.fetch = jest.fn();

describe('ChooseVan Component', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key) => {
			if (key === 'companyId') return 'mock-company-id';
			if (key === 'driverId') return 'mock-driver-id';
			return null;
        });
  
      	(fetch as jest.Mock).mockImplementation((url) => {
			if (url.includes('/view-vans')) {
				return Promise.resolve({
					json: () =>
					Promise.resolve([
						{
						van_id: 'van1',
						van_nickname: 'Minty',
						van_reg: 'ICE123',
						in_use: false,
						},
					]),
					ok: true,
				});
			}
  
			if (url.includes('/choose-van')) {
				return Promise.resolve({
					json: () => Promise.resolve({ success: true }),
					ok: true,
				});
			}
  
        	return Promise.reject('Unknown endpoint');
      	});
    });
  
    afterEach(() => {
      	jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByText } = render(<ChooseVan />);
        expect(getByText('Available Vans')).toBeTruthy();
    });

	it('displays a van card and handles select press', async () => {
		const { getByText } = render(<ChooseVan />);
		
		await waitFor(() => {
			expect(getByText('Minty')).toBeTruthy();
			expect(getByText('ICE123')).toBeTruthy();
		});
	
		const selectButton = getByText('Select');
		fireEvent.press(selectButton);
	
		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith({
				pathname: '/(auth)/TrackVan',
				params: {
				vanId: 'van1',
				driverId: 'mock-driver-id',
				},
			});
		});
	});

	it('displays error if fetching vans fails', async () => {
		(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
	  
		render(<ChooseVan />);
	  
		await waitFor(() => {
		  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/view-vans'), expect.anything());
		});
	});

	it('shows alert if selecting a van fails', async () => {

		(fetch as jest.Mock)
			.mockResolvedValueOnce({
				json: async () => [
					{
						van_id: '1',
						van_nickname: 'Minty',
						van_reg: 'ICE123',
						in_use: false,
					}
				],
				ok: true,
			}) 
			.mockRejectedValueOnce(new Error('Server down'));
	  
		
		const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
	  
		const { getByText } = render(<ChooseVan />);
	  
		await waitFor(() => expect(getByText('Select')).toBeTruthy());
	  
		fireEvent.press(getByText('Select'));
	  
		await waitFor(() => {
		  expect(alertSpy).toHaveBeenCalledWith("Error", "Sorry, there was an error. Please try again.");
		});
	  
		alertSpy.mockRestore();
	  });	 
	  
	  it('throws an error and handles it with the correct message', async () => {
		const errorMessage = 'Custom error message';
	  
		(fetch as jest.Mock)
			.mockResolvedValueOnce({
				json: async () => [
				{
					van_id: '1',
					van_nickname: 'Minty',
					van_reg: 'ICE123',
					in_use: false,
				}
				],
				ok: true,
			})  
		  	.mockRejectedValueOnce(new Error('Server down'));  
	  
		const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
	  
		const { getByText } = render(<ChooseVan />);
	  
		await waitFor(() => expect(getByText('Select')).toBeTruthy());
	  
		fireEvent.press(getByText('Select'));
	  
		await waitFor(() => {
			expect(alertSpy).toHaveBeenCalledWith(
				"Error",
				expect.stringContaining("Sorry, there was an error. Please try again.")
			);
		});
	  
		alertSpy.mockClear(); 
	  
		(fetch as jest.Mock)
			.mockResolvedValueOnce({
				json: async () => ({}),  
				ok: false,  
			});
	  
		fireEvent.press(getByText('Select'));
	
		await waitFor(() => {
			expect(alertSpy).toHaveBeenCalledWith(
				"Error",
				expect.stringContaining("Please try again")
			);
		});
	  
		alertSpy.mockRestore();  
	});

	it('applies the correct backgroundColor based on pressed state', () => {
		expect(getVanCardStyle(true).backgroundColor).toBe('#b8ecce');
		expect(getVanCardStyle(false).backgroundColor).toBe('#eab2bb');
	  });	  
});
