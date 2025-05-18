import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ViewDrivers from '../viewDrivers';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { getPressableStyle } from '../viewDrivers'; 
import { Alert } from 'react-native';
import { act } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
}));

jest.spyOn(Alert, 'alert');
global.fetch = jest.fn();

describe('ViewDrivers', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('company-123');
        jest.clearAllMocks();
    });

    it('renders driver cards', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                driver_id: '1',
                driver_first_name: 'John',
                driver_last_name: 'Doe',
                company_id: 'company-123',
                email: 'john@example.com',
                role: 'driver',
                is_active: true,
                },
            ],
        });

        const { getByText } = render(<ViewDrivers />);

        await waitFor(() => {
            expect(getByText('John')).toBeTruthy();
            expect(getByText('Doe')).toBeTruthy();
            expect(getByText('john@example.com')).toBeTruthy();
        });
    }, 10000);

    it('navigates to add driver screen', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        const { getByText } = render(<ViewDrivers />);

        const addButton = getByText('Add Driver');
        fireEvent.press(addButton);
        expect(mockPush).toHaveBeenCalledWith('/(authOwner)/addDrivers');
    });

    it('opens edit modal when edit icon is pressed', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                driver_id: '2',
                driver_first_name: 'Alice',
                driver_last_name: 'Walker',
                company_id: 'company-123',
                email: 'alice@example.com',
                role: 'driver',
                is_active: false,
                },
            ],
        });

        const { getByText, getByLabelText } = render(<ViewDrivers />);
        await waitFor(() => getByText('Alice'));

        fireEvent.press(getByLabelText('edit-button'));

        await waitFor(() => {
            expect(getByText('First Name')).toBeTruthy();
        });
    });

    it('applies the correct backgroundColor based on pressed state', () => {
        expect(getPressableStyle(true).backgroundColor).toBe('#b8ecce');
        expect(getPressableStyle(false).backgroundColor).toBe('#eab2bb');
    });

    it('displays error if fetching drivers fails', async () => {
		(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
	  
		render(<ViewDrivers />);
	  
		await waitFor(() => {
		  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/view-drivers'), expect.anything());
		});
	});

    it('successfully edits a driver', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    driver_id: '2',
                    driver_first_name: 'Alice',
                    driver_last_name: 'Walker',
                    company_id: 'company-123',
                    email: 'alice@example.com',
                    role: 'driver',
                    is_active: false,
                },
            ],
        });
      
        const { getByText, getByLabelText } = render(<ViewDrivers />);
        await waitFor(() => expect(getByText('View Your Drivers')).toBeTruthy());
        await waitFor(() => expect(getByText('Alice')).toBeTruthy());
        fireEvent.press(getByLabelText('edit-button'));
    
        await waitFor(() => expect(getByText('First Name')).toBeTruthy());
      
        fireEvent.changeText(getByLabelText('first-name-input'), 'Alicia');
        fireEvent.changeText(getByLabelText('last-name-input'), 'Smith');
    
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: 'Driver updated successfully',
            }),
        });
      
        fireEvent.press(getByLabelText('save-button'));
      
        await waitFor(() => {     
            expect(getByText('View Your Drivers')).toBeTruthy();
            expect(getByText('Alicia')).toBeTruthy();
        });
    });

    it('alerts when no edits made', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    driver_id: '2',
                    driver_first_name: 'Alice',
                    driver_last_name: 'Walker',
                    company_id: 'company-123',
                    email: 'alice@example.com',
                    role: 'driver',
                    is_active: false,
                },
            ],
        });
      
        const { getByText, getByLabelText } = render(<ViewDrivers />);
        await waitFor(() => expect(getByText('View Your Drivers')).toBeTruthy());
        await waitFor(() => expect(getByText('Alice')).toBeTruthy());
        fireEvent.press(getByLabelText('edit-button'));
    
        await waitFor(() => expect(getByText('First Name')).toBeTruthy());
      
        fireEvent.press(getByLabelText('save-button'));
      
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                "No changes detected",
                expect.stringContaining("Please make some changes before saving.")
            );
        });
    });

    it('alerts when an email is already registered', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    driver_id: '2',
                    driver_first_name: 'Alice',
                    driver_last_name: 'Walker',
                    company_id: 'company-123',
                    email: 'alice@example.com',
                    role: 'driver',
                    is_active: false,
                },
            ],
        });
      
        const { getByText, getByLabelText } = render(<ViewDrivers />);
        await waitFor(() => expect(getByText('View Your Drivers')).toBeTruthy());
        await waitFor(() => expect(getByText('Alice')).toBeTruthy());
        fireEvent.press(getByLabelText('edit-button'));
    
        await waitFor(() => expect(getByText('First Name')).toBeTruthy());

        fireEvent.changeText(getByLabelText('first-name-input'), 'Alicia');
        fireEvent.changeText(getByLabelText('email-input'), 'newalice@example.com');
    
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            new Promise(resolve =>
              
                resolve({
                    ok: false,
                    json: async () => ({ error: 'Already registered' }),
                })
        ));
      
        await act(async () => {
            fireEvent.press(getByLabelText('save-button'));
        });
      
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                "Error",
                expect.stringContaining("This driver is already registered")
            );
        });
    });

    it('alerts when there is a generic error', async () => {
        const mockError = jest.spyOn(global, 'Error');
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    driver_id: '2',
                    driver_first_name: 'Alice',
                    driver_last_name: 'Walker',
                    company_id: 'company-123',
                    email: 'alice@example.com',
                    role: 'driver',
                    is_active: false,
                },
            ],
        });
      
        const { getByText, getByLabelText } = render(<ViewDrivers />);
        await waitFor(() => expect(getByText('View Your Drivers')).toBeTruthy());
        await waitFor(() => expect(getByText('Alice')).toBeTruthy());
        fireEvent.press(getByLabelText('edit-button'));
    
        await waitFor(() => expect(getByText('First Name')).toBeTruthy());

        fireEvent.changeText(getByLabelText('first-name-input'), 'Alicia');
        fireEvent.changeText(getByLabelText('email-input'), 'newalice@example.com');
    
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            new Promise(resolve =>
              
                resolve({
                    ok: false,
                    json: async () => ({ }),
                })
        ));
      
        await act(async () => {
            fireEvent.press(getByLabelText('save-button'));
        });
      
        await waitFor(() => {
            expect(mockError).toHaveBeenCalledWith("Failed to update driver");
        });
        mockError.mockRestore();
    });

    it('should delete a driver successfully', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    driver_id: '2',
                    driver_first_name: 'Alice',
                    driver_last_name: 'Walker',
                    company_id: 'company-123',
                    email: 'alice@example.com',
                    role: 'driver',
                    is_active: false,
                },
                { 
                    driver_id: '1', 
                    driver_first_name: 'John', 
                    driver_last_name: 'Doe', 
                    company_id: 'company-123',
                    email: 'john.doe@example.com',
                    role: 'driver', 
                    isActive: true 
                },
            ],
        });
        const { getByText, getByLabelText, queryByText, getAllByLabelText } = render(<ViewDrivers />);
    
        await waitFor(() => expect(getByText('Alice')).toBeTruthy());
        await waitFor(() => expect(getByText('John')).toBeTruthy());
    
        fireEvent.press(getAllByLabelText('delete-button')[0]);
    
        await waitFor(() => getByText("Are you sure you want to delete Alice Walker?"));
        
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            new Promise(resolve =>
              
                resolve({
                    ok: true,
                    
                })
        ));
        fireEvent.press(getByLabelText('confirm-delete-button'));
    
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/delete-driver'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('2'),
          })
        );
    
        await waitFor(() => expect(queryByText('Alice Walker')).toBeNull());
        await waitFor(() => expect(getByText('View Your Drivers')).toBeTruthy());
    });

    it('handles unsuccessful deletion', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    driver_id: '2',
                    driver_first_name: 'Alice',
                    driver_last_name: 'Walker',
                    company_id: 'company-123',
                    email: 'alice@example.com',
                    role: 'driver',
                    is_active: false,
                },
                { 
                    driver_id: '1', 
                    driver_first_name: 'John', 
                    driver_last_name: 'Doe', 
                    company_id: 'company-123',
                    email: 'john.doe@example.com',
                    role: 'driver', 
                    isActive: true 
                },
            ],
        });
        const { getByText, getByLabelText, queryByText, getAllByLabelText } = render(<ViewDrivers />);
    
        await waitFor(() => expect(getByText('Alice')).toBeTruthy());
        await waitFor(() => expect(getByText('John')).toBeTruthy());
    
        fireEvent.press(getAllByLabelText('delete-button')[0]);
    
        await waitFor(() => getByText("Are you sure you want to delete Alice Walker?"));
        
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            new Promise(resolve =>
              
                resolve({
                    ok: false,
                    
                })
        ));
        fireEvent.press(getByLabelText('confirm-delete-button'));
    
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error deleting driver details");            
        });
        consoleErrorSpy.mockRestore();
    });

    it('handles unsuccessful deletion and triggers catch block', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    driver_id: '2',
                    driver_first_name: 'Alice',
                    driver_last_name: 'Walker',
                    company_id: 'company-123',
                    email: 'alice@example.com',
                    role: 'driver',
                    is_active: false,
                },
            ],
        });
      
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
        const { getByText, getAllByLabelText, getByLabelText } = render(<ViewDrivers />);
      
        await waitFor(() => expect(getByText('Alice')).toBeTruthy());
      
        fireEvent.press(getAllByLabelText('delete-button')[0]);
      
        await waitFor(() =>
            expect(getByText("Are you sure you want to delete Alice Walker?")).toBeTruthy()
        );
      
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      
        fireEvent.press(getByLabelText('confirm-delete-button'));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining("Error deleting driver:"),
                expect.anything() // This could be an Error or something else
            );
        });
      
        consoleErrorSpy.mockRestore();
    });
      
    it('displays an error for an invalid first name', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    driver_id: '2',
                    driver_first_name: 'Alice',
                    driver_last_name: 'Walker',
                    company_id: 'company-123',
                    email: 'alice@example.com',
                    role: 'driver',
                    is_active: false,
                },
            ],
        });
      
        const { getByText, getByLabelText } = render(<ViewDrivers />);
        await waitFor(() => expect(getByText('View Your Drivers')).toBeTruthy());
        await waitFor(() => expect(getByText('Alice')).toBeTruthy());
        fireEvent.press(getByLabelText('edit-button'));
    
        await waitFor(() => expect(getByText('First Name')).toBeTruthy());
      
        fireEvent.changeText(getByLabelText('first-name-input'), 'A');
      
        fireEvent.press(getByLabelText('save-button'));
      
        await waitFor(() => {     
            expect(getByText('Must be at least 2 characters')).toBeTruthy();
        });
    });

    it('displays an error for an invalid last name', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    driver_id: '2',
                    driver_first_name: 'Alice',
                    driver_last_name: 'Walker',
                    company_id: 'company-123',
                    email: 'alice@example.com',
                    role: 'driver',
                    is_active: false,
                },
            ],
        });
      
        const { getByText, getByLabelText } = render(<ViewDrivers />);
        await waitFor(() => expect(getByText('View Your Drivers')).toBeTruthy());
        await waitFor(() => expect(getByText('Alice')).toBeTruthy());
        fireEvent.press(getByLabelText('edit-button'));
    
        await waitFor(() => expect(getByText('First Name')).toBeTruthy());
      
        fireEvent.changeText(getByLabelText('last-name-input'), 'W');
      
        fireEvent.press(getByLabelText('save-button'));
      
        await waitFor(() => {     
            expect(getByText('Must be at least 2 characters')).toBeTruthy();
        });
    });

    it('displays an error for an invalid email', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    driver_id: '2',
                    driver_first_name: 'Alice',
                    driver_last_name: 'Walker',
                    company_id: 'company-123',
                    email: 'alice@example.com',
                    role: 'driver',
                    is_active: false,
                },
            ],
        });
      
        const { getByText, getByLabelText } = render(<ViewDrivers />);
        await waitFor(() => expect(getByText('View Your Drivers')).toBeTruthy());
        await waitFor(() => expect(getByText('Alice')).toBeTruthy());
        fireEvent.press(getByLabelText('edit-button'));
    
        await waitFor(() => expect(getByText('First Name')).toBeTruthy());
      
        fireEvent.changeText(getByLabelText('email-input'), 'A');
      
        fireEvent.press(getByLabelText('save-button'));
      
        await waitFor(() => {     
            expect(getByText('Invalid email address')).toBeTruthy();
        });
    });

    it('handles the close button being used in the modal', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    driver_id: '2',
                    driver_first_name: 'Alice',
                    driver_last_name: 'Walker',
                    company_id: 'company-123',
                    email: 'alice@example.com',
                    role: 'driver',
                    is_active: false,
                },
            ],
        });
      
        const { getByText, getByLabelText } = render(<ViewDrivers />);
        await waitFor(() => expect(getByText('View Your Drivers')).toBeTruthy());
        await waitFor(() => expect(getByText('Alice')).toBeTruthy());
        fireEvent.press(getByLabelText('edit-button'));
        await waitFor(() => expect(getByText('First Name')).toBeTruthy());
        fireEvent.press(getByLabelText('close-button'));
        await waitFor(() => expect(getByText('View Your Drivers')).toBeTruthy());
    });     
      
});
