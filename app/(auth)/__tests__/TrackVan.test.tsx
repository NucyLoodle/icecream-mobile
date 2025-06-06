import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TrackVan from '../TrackVan';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { getVanCardStyle } from '../TrackVan';
import { BackHandler } from 'react-native';

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

jest.spyOn(Alert, 'alert').mockImplementation(() => { });
jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

const renderWithNavigation = (ui: React.ReactElement) => {
	return render(
		<NavigationContainer>
			{ui}
		</NavigationContainer>
	);
};


const mockSend = jest.fn();
const mockClose = jest.fn();

class MockWebSocket {
	static CONNECTING = 0;
	static OPEN = 1;
	static CLOSING = 2;
	static CLOSED = 3;

	readyState = MockWebSocket.OPEN;
	send = mockSend;
	close = mockClose;
	onopen = jest.fn();
	onerror = jest.fn();
	onclose = jest.fn();
	onmessage = jest.fn();

	constructor(_url: string) { }
}

global.WebSocket = MockWebSocket as unknown as typeof WebSocket;


describe('TrackVan Screen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	beforeAll(() => {
		jest.useFakeTimers();
	});
	afterAll(() => {
		jest.useRealTimers();
	});

	afterEach(() => {
		jest.clearAllMocks();
		mockClose(); // ensure socket is closed
	});

	it('renders correctly with initial content', async () => {
		const { getByText } = renderWithNavigation(<TrackVan />);
		await waitFor(() => {
			expect(getByText('Van Tracking')).toBeTruthy();
			expect(getByText('Share My Location')).toBeTruthy();
			expect(getByText('Stop Sharing')).toBeTruthy();
		});
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


	it('sends payload when socket is open and location updates', async () => {
		const { unmount } = renderWithNavigation(<TrackVan />);
		const flushPromises = () => new Promise(setImmediate);
		const mockCoords = {
			latitude: 51.5074,
			longitude: -0.1278,
		};

		const mockWatchPositionAsync = jest.fn((options, callback) => {
			// Simulate a location update
			setTimeout(() => {
				callback({ coords: mockCoords });
			}, 10);

			return Promise.resolve({
				remove: jest.fn(),
			});
		});

		(Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
		(Location.watchPositionAsync as jest.Mock).mockImplementation(mockWatchPositionAsync);

		const { getByText } = renderWithNavigation(<TrackVan />);

		const shareButton = getByText('Share My Location');
		fireEvent.press(shareButton);

		await waitFor(() => {
			expect(mockSend).toHaveBeenCalledWith(
				JSON.stringify({
				type: 'newLocation',
				vanId: 'test-van-id',
				lat: mockCoords.latitude,
				lng: mockCoords.longitude,
				})
			);
		});
		unmount();
		flushPromises();
	});

	it('sends payload when socket is open and location updates', async () => {
		const mockCoords = { latitude: 51.5074, longitude: -0.1278 };

		(Location.requestForegroundPermissionsAsync as jest.Mock)
			.mockResolvedValue({ status: 'granted' });

		(Location.watchPositionAsync as jest.Mock).mockImplementation((_o, cb) => {
			// call immediately – no real timer
			cb({ coords: mockCoords });
			return Promise.resolve({ remove: jest.fn() });
		});

		const { getByText, unmount } = renderWithNavigation(<TrackVan />);

		fireEvent.press(getByText('Share My Location'));

		await waitFor(() =>
			expect(mockSend).toHaveBeenCalledWith(
				JSON.stringify({
					type: 'newLocation',
					vanId: 'test-van-id',
					lat: mockCoords.latitude,
					lng: mockCoords.longitude,
				})
			)
		);

		unmount();
	});


	it('applies the correct backgroundColor based on pressed state', () => {
		expect(getVanCardStyle(true).backgroundColor).toBe('#b8ecce');
		expect(getVanCardStyle(false).backgroundColor).toBe('#eab2bb');
	});

	it('stops sharing and sends "vanStopped" payload, closes WebSocket', async () => {
		const mockRemove = jest.fn();

		const mockWatchPositionAsync = jest.fn((_options, callback) => {
			callback({ coords: { latitude: 51.5074, longitude: -0.1278 } });
			return Promise.resolve({ remove: mockRemove });
		});

		(Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
		(Location.watchPositionAsync as jest.Mock).mockImplementation(mockWatchPositionAsync);

		const { getByText } = renderWithNavigation(<TrackVan />);

		// Start sharing
		fireEvent.press(getByText('Share My Location'));

		await waitFor(() => {
			expect(getByText('Stop Sharing')).not.toBeDisabled();
		});

		// Stop sharing
		fireEvent.press(getByText('Stop Sharing'));

		await waitFor(() => {
			expect(mockRemove).toHaveBeenCalled(); // location subscription removed
			expect(mockSend).toHaveBeenCalledWith(
				JSON.stringify({
					vanId: 'test-van-id',
					type: 'vanStopped',
				})
			);
			expect(mockClose).toHaveBeenCalled(); // WebSocket closed
		});
	});

	it('allows default back behavior when not sharing', () => {
		jest.spyOn(global, 'fetch').mockResolvedValueOnce({
			ok: true,
			json: async () => ({}),
		} as Response);
		const removeEventListenerSpy = jest.spyOn(BackHandler, 'removeEventListener');

		const { unmount } = renderWithNavigation(<TrackVan />);

		const backHandler = BackHandler as any;
		const listeners = backHandler._eventHandlers?.['hardwareBackPress'] ?? [];
		const result = listeners.map((listener: any) => listener()).some(Boolean);

		expect(result).toBe(false);

		unmount();
		expect(removeEventListenerSpy).toHaveBeenCalledWith('hardwareBackPress', expect.any(Function));
	});



});
