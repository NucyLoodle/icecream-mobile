import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddDrivers from '../addDrivers';
import * as SecureStore from 'expo-secure-store';
import { getPressableStyle } from '../addDrivers'; 
import { Alert } from 'react-native';
import { TextInput } from 'react-native';

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

describe('AddDrivers Component', () => {
    beforeEach(() => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key) => {
            if (key === 'companyId') return 'mock-company-id';
            return null;
        });
    
        (fetch as jest.Mock).mockImplementation((url) => {     
            if (url.includes('/add-drivers')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true }),
                    ok: true,
                });
            }
    
            return Promise.reject('Unknown endpoint');
        });
        jest.spyOn(TextInput.prototype, 'focus').mockImplementation(() => {});
        jest.clearAllMocks();
    });

    it('renders correctly', async () => {            
        const { getByText } = render(<AddDrivers/>);

        await waitFor(() => {
            expect(getByText('Please provide their email and full name. An invite link will be emailed to your driver.')).toBeTruthy();
        });
    });

    it('applies the correct backgroundColor based on pressed state', () => {
        expect(getPressableStyle(true).backgroundColor).toBe('#b8ecce');
        expect(getPressableStyle(false).backgroundColor).toBe('#eab2bb');
    });

    it('displays error message if the first name is missing ', async () => {
        const { getByText, getByLabelText } = render(<AddDrivers />);
    
        const firstNameInput = getByLabelText('First name');
        
        fireEvent.changeText(firstNameInput, ''); 
        fireEvent.press(getByText('Submit'));  
    
        await waitFor(() => {
            expect(getByText("Your first name is required")).toBeTruthy();
        });
    
    });

    it('displays error message if the surname is missing ', async () => {
        const { getByText, getByLabelText } = render(<AddDrivers />);

        const surnameInput = getByLabelText('surname');

        fireEvent.changeText(surnameInput, ''); 
        fireEvent.press(getByText('Submit')); 
    
        await waitFor(() => {
            expect(getByText("Your surname is required")).toBeTruthy();
        });
    
    });

    it('displays error message if the email is invalid ', async () => {
        const { getByText, getByLabelText } = render(<AddDrivers />);

        const emailInput = getByLabelText('email');

        fireEvent.changeText(emailInput, 'email'); 
        fireEvent.press(getByText('Submit'));  

        await waitFor(() => {
            expect(getByText("Please enter a valid email.")).toBeTruthy();
        });
    
    });

    it('submits the form and redirects on success', async () => {
        const { getByLabelText, getByText } = render(<AddDrivers />);
    
        const firstNameInput = getByLabelText('First name');
        const lastNameInput = getByLabelText('surname');
        const emailInput = getByLabelText('email');
    
        fireEvent.changeText(firstNameInput, 'John');
        fireEvent.changeText(lastNameInput, 'Doe');
        fireEvent.changeText(emailInput, 'john.doe@example.com');
        fireEvent.press(getByText('Submit')); 
    
        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith("/(authOwner)/(tabsOwner)");
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/(authOwner)/viewDrivers");
        });

    });
       
    it('handles API failure gracefully with an error message', async () => {
        (fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ error: "Something went wrong" })
            })
        );
    
        const { getByLabelText, getByText } = render(<AddDrivers />);
    
        fireEvent.changeText(getByLabelText('First name'), 'Test');
        fireEvent.changeText(getByLabelText('surname'), 'User');
        fireEvent.changeText(getByLabelText('email'), 'test@example.com');
    
        fireEvent.press(getByText('Submit'));
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                "Error",
                expect.stringContaining("Sorry, there was an error")
            );
        });
    });
    
    
    it('displays an error message if the driver is already registered', async () => {
        (fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ error: "Already registered" })
            })
        );
    
        const { getByLabelText, getByText } = render(<AddDrivers />);
    
        fireEvent.changeText(getByLabelText('First name'), 'Test');
        fireEvent.changeText(getByLabelText('surname'), 'User');
        fireEvent.changeText(getByLabelText('email'), 'test@example.com');
    
        fireEvent.press(getByText('Submit'));
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                "Error",
                expect.stringContaining("This driver is already registered")
            );
        });
    });

    it('displays an error message if the confirmation email does not send', async () => {
        (fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ error: "Failed to send verification email." })
            })
        );
    
        const { getByLabelText, getByText } = render(<AddDrivers />);
    
        fireEvent.changeText(getByLabelText('First name'), 'Test');
        fireEvent.changeText(getByLabelText('surname'), 'User');
        fireEvent.changeText(getByLabelText('email'), 'test@example.com');
    
        fireEvent.press(getByText('Submit'));
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                "Error",
                expect.stringContaining("Unfortunately, we weren't able to send a verification email. Please delete the driver and try again.")
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
    
        const { getByLabelText, getByText } = render(<AddDrivers />);
    
        fireEvent.changeText(getByLabelText('First name'), 'Test');
        fireEvent.changeText(getByLabelText('surname'), 'User');
        fireEvent.changeText(getByLabelText('email'), 'test@example.com');
    
        fireEvent.press(getByText('Submit'));
    
        await waitFor(() => {
            expect(mockError).toHaveBeenCalledWith("Failed to add driver");
        });
        mockError.mockRestore();
    }); 

    it('focuses last name when you submit first name', () => {
        const { getByLabelText } = render(<AddDrivers />);
        fireEvent(getByLabelText('First name'), 'submitEditing');
        expect(TextInput.prototype.focus).toHaveBeenCalledTimes(1);
    });

    it('focuses email when you submit last name', () => {
        const { getByLabelText } = render(<AddDrivers />);
        fireEvent(getByLabelText('surname'), 'submitEditing');
        expect(TextInput.prototype.focus).toHaveBeenCalledTimes(1);
    });
      
});

