import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddVans from '../addVans';
import * as SecureStore from 'expo-secure-store';
import { getPressableStyle } from '../addVans'; 
import { Alert } from 'react-native';


const mockPush = jest.fn();
const mockReplace = jest.fn();
global.fetch = jest.fn();
jest.spyOn(Alert, 'alert');

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
}));

describe('AddVans Component', () => {
    beforeEach(() => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key) => {
            if (key === 'companyId') return 'mock-company-id';
            return null;
        });
    
        (fetch as jest.Mock).mockImplementation((url) => {     
            if (url.includes('/add-vans')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true }),
                    ok: true,
                });
            }
    
            return Promise.reject('Unknown endpoint');
        });
        jest.clearAllMocks();
    });

    it('renders correctly', async () => {            
        const { getByText } = render(<AddVans/>);

        await waitFor(() => {
            expect(getByText('Please provide the van registration. A nickname is optional, but fun!')).toBeTruthy();
        });
    });

    it('applies the correct backgroundColor based on pressed state', () => {
        expect(getPressableStyle(true).backgroundColor).toBe('#b8ecce');
        expect(getPressableStyle(false).backgroundColor).toBe('#eab2bb');
    });

    it('displays error message if the van reg is missing ', async () => {
        const { getByText, getByLabelText } = render(<AddVans />);
    
        const vanRegInput = getByLabelText('van registration plate');
        const vanNickInput = getByLabelText('van nickname');
        
        fireEvent.changeText(vanRegInput, ''); 
        fireEvent.changeText(vanNickInput, 'Ice Van');
        fireEvent.press(getByText('Submit'));  
    
        await waitFor(() => {
            expect(getByText("Van registration required")).toBeTruthy();
        });
    
    });


    it('submits the form and redirects on success', async () => {
        const { getByText, getByLabelText } = render(<AddVans />);
    
        const vanRegInput = getByLabelText('van registration plate');
        const vanNickInput = getByLabelText('van nickname');
        fireEvent.changeText(vanRegInput, 'VR89 9VR'); 
        fireEvent.changeText(vanNickInput, 'Ice Van');
        fireEvent.press(getByText('Submit')); 
    
        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith("/(authOwner)/(tabsOwner)");
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/(authOwner)/viewVans");
        });

    });

    it('handles an empty nickname', async () => {
        const { getByText, getByLabelText } = render(<AddVans />);
    
        const vanRegInput = getByLabelText('van registration plate');
        fireEvent.changeText(vanRegInput, 'VR89 9VR'); 

        fireEvent.press(getByText('Submit')); 
    
        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith("/(authOwner)/(tabsOwner)");
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/(authOwner)/viewVans");
        });

    });


    
    
    it('displays an error message if the driver is already registered', async () => {
        (fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ error: "Already registered" })
            })
        );
    
        const { getByText, getByLabelText } = render(<AddVans />);
    
        const vanRegInput = getByLabelText('van registration plate');
        
        fireEvent.changeText(vanRegInput, 'VR89 9VR'); 
        fireEvent.press(getByText('Submit'));
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                "Error",
                expect.stringContaining("This van is already registered")
            );
        });
    });

    it('displays a generic error message if there is no response', async () => {
        const mockError = jest.spyOn(global, 'Error');
        (fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({})
            })
        );
    
        const { getByText, getByLabelText } = render(<AddVans />);
    
        const vanRegInput = getByLabelText('van registration plate');
        
        fireEvent.changeText(vanRegInput, 'VR89 9VR'); 
        fireEvent.press(getByText('Submit'));
    
        await waitFor(() => {
            expect(mockError).toHaveBeenCalledWith("Failed to add van");
        });
        mockError.mockRestore();
    }); 
      
});

