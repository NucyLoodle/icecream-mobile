import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TrackVan from '../TrackVan';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// Mock router & navigation
jest.mock('expo-router', () => ({
	useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
	useLocalSearchParams: () => ({ vanId: 'test-van-id', driverId: 'test-driver-id' }),
}));

// Mock Location API
jest.mock('expo-location', () => ({
	requestForegroundPermissionsAsync: jest.fn(),
	watchPositionAsync: jest.fn(),
	Accuracy: { High: 1 },
}));



jest.spyOn(Alert, 'alert').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

const renderWithNavigation = (ui: React.ReactElement) => {
	return render(
		<NavigationContainer>
			{ui}
		</NavigationContainer>
	);
};

describe('TrackVan Screen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders correctly with initial content', () => {
		const { getByText } = renderWithNavigation(<TrackVan />);
		expect(getByText('Van Tracking')).toBeTruthy();
		expect(getByText('Share My Location')).toBeTruthy();
		expect(getByText('Stop Sharing')).toBeTruthy();
	});

	it('disables "Stop Sharing" button initially', () => {
		const { getByText } = renderWithNavigation(<TrackVan />);
		const stopButton = getByText('Stop Sharing');
		expect(stopButton).toBeDisabled();
	});

	it('requests permission and starts sharing on "Share My Location" press', async () => {
		(Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });
		(Location.watchPositionAsync as jest.Mock).mockImplementationOnce((_opts, callback) => {
			callback({
				coords: {
				latitude: 51.5074,
				longitude: 0.1278,
				},
			});
		return Promise.resolve({ remove: jest.fn() });
		});

    const { getByText, queryByText } = renderWithNavigation(<TrackVan />);
    fireEvent.press(getByText('Share My Location'));

    await waitFor(() => {
		expect(queryByText(/Latitude/)).toBeTruthy();
		expect(queryByText(/Longitude/)).toBeTruthy();
    });
  });

	it('shows alert if location permission is denied', async () => {
		(Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });

		const { getByText } = renderWithNavigation(<TrackVan />);
		fireEvent.press(getByText('Share My Location'));

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				'Permission Denied',
				'Enable location services to track your van.'
			);
		});
	});
	  
});
