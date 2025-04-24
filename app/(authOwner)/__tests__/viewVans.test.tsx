import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ViewVans from '../viewVans';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { getPressableStyle } from '../viewVans'; 
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

describe('ViewVans', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('company-123');
        jest.clearAllMocks();
    });

    it('renders van cards', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                van_id: '1',
                van_nickname: 'Frosty Wheels',
                van_reg: 'FW09 ICE',
                },
            ],
        });

        const { getByText } = render(<ViewVans />);

        await waitFor(() => {
            expect(getByText('Frosty Wheels')).toBeTruthy();
            expect(getByText('FW09 ICE')).toBeTruthy();
        });
    });

    it('navigates to add van screen', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        const { getByText } = render(<ViewVans />);

        const addButton = getByText('Add Van');
        fireEvent.press(addButton);
        expect(mockPush).toHaveBeenCalledWith('/(authOwner)/addVans');
    });

    it('opens edit modal when edit icon is pressed', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    van_id: '1',
                    van_nickname: 'Frosty Wheels',
                    van_reg: 'FW09 ICE',
                },
            ],
        });

        const { getByText, getByLabelText } = render(<ViewVans />);
        await waitFor(() => getByText('Frosty Wheels'));

        fireEvent.press(getByLabelText('edit-button'));

        await waitFor(() => {
            expect(getByText('Van Registration Plate')).toBeTruthy();
        });
    });

    it('applies the correct backgroundColor based on pressed state', () => {
        expect(getPressableStyle(true).backgroundColor).toBe('#b8ecce');
        expect(getPressableStyle(false).backgroundColor).toBe('#eab2bb');
    });

    it('displays error if fetching drivers fails', async () => {
		(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
	  
		render(<ViewVans />);
	  
		await waitFor(() => {
		    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/view-vans'), expect.anything());
		});
	});

    it('successfully edits a van', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    van_id: '2',
                    van_nickname: 'Nicey Icey',
                    van_reg: 'NI09 ICE',
                },
            ],
        });
      
        const { getByText, getByLabelText } = render(<ViewVans />);
        await waitFor(() => expect(getByText('View Your Vans')).toBeTruthy());
        await waitFor(() => expect(getByText('Nicey Icey')).toBeTruthy());
        fireEvent.press(getByLabelText('edit-button'));
    
        await waitFor(() => expect(getByText('Van Registration Plate')).toBeTruthy());
      
        fireEvent.changeText(getByLabelText('van-registration-plate-input'), 'NI08 ICE');
        fireEvent.changeText(getByLabelText('van-nickname-input'), 'Nice Ice');
    
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: 'Van updated successfully',
            }),
        });
      
        fireEvent.press(getByLabelText('save-button'));
      
        await waitFor(() => {     
            expect(getByText('View Your Vans')).toBeTruthy();
            expect(getByText('Nice Ice')).toBeTruthy();
        });
    });

    it('alerts when no edits made', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    van_id: '2',
                    van_nickname: 'Nicey Icey',
                    van_reg: 'NI09 ICE',
                },
            ],
        });
      
        const { getByText, getByLabelText } = render(<ViewVans />);
        await waitFor(() => expect(getByText('View Your Vans')).toBeTruthy());
        await waitFor(() => expect(getByText('Nicey Icey')).toBeTruthy());
        fireEvent.press(getByLabelText('edit-button'));
    
        await waitFor(() => expect(getByText('Van Registration Plate')).toBeTruthy());
      
        fireEvent.press(getByLabelText('save-button'));
      
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                "No changes detected",
                expect.stringContaining("Please make some changes before saving.")
            );
        });
    });

    it('alerts when a van is already registered', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    van_id: '2',
                    van_nickname: 'Nicey Icey',
                    van_reg: 'NI09 ICE',
                },
            ],
        });
      
        const { getByText, getByLabelText } = render(<ViewVans />);
        await waitFor(() => expect(getByText('View Your Vans')).toBeTruthy());
        await waitFor(() => expect(getByText('Nicey Icey')).toBeTruthy());
        fireEvent.press(getByLabelText('edit-button'));
    
        await waitFor(() => expect(getByText('Van Registration Plate')).toBeTruthy());

        fireEvent.changeText(getByLabelText('van-registration-plate-input'), 'NI08 ICE');
        fireEvent.changeText(getByLabelText('van-nickname-input'), 'Nice Ice');
    
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
                expect.stringContaining("This van is already registered")
            );
        });
    });

    it('alerts when there is a generic error', async () => {
        const mockError = jest.spyOn(global, 'Error');
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    van_id: '2',
                    van_nickname: 'Nicey Icey',
                    van_reg: 'NI09 ICE',
                },
            ],
        });
      
        const { getByText, getByLabelText } = render(<ViewVans />);
        await waitFor(() => expect(getByText('View Your Vans')).toBeTruthy());
        await waitFor(() => expect(getByText('Nicey Icey')).toBeTruthy());
        fireEvent.press(getByLabelText('edit-button'));
    
        await waitFor(() => expect(getByText('Van Registration Plate')).toBeTruthy());

        fireEvent.changeText(getByLabelText('van-registration-plate-input'), 'NI08 ICE');
        fireEvent.changeText(getByLabelText('van-nickname-input'), 'Nice Ice');
    
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
            expect(mockError).toHaveBeenCalledWith("Failed to update van");
        });
        mockError.mockRestore();
    });

    it('should delete a driver successfully', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    van_id: '2',
                    van_nickname: 'Nicey Icey',
                    van_reg: 'NI09 ICE',
                },
                { 
                    van_id: '1',
                    van_nickname: 'Frosty Wheels',
                    van_reg: 'FW09 ICE',
                },
            ],
        });
        const { getByText, getByLabelText, getAllByLabelText, queryByText } = render(<ViewVans />);
        await waitFor(() => expect(getByText('View Your Vans')).toBeTruthy());
        await waitFor(() => expect(getByText('Nicey Icey')).toBeTruthy());
    
        fireEvent.press(getAllByLabelText('delete-button')[0]);
    
        await waitFor(() => getByText("Are you sure you want to delete Nicey Icey?"));
        
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            new Promise(resolve =>
              
                resolve({
                    ok: true,
                    
                })
        ));
        fireEvent.press(getByLabelText('confirm-delete-button'));
    
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/delete-van'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('2'),
          })
        );
    
        await waitFor(() => expect(queryByText('Nicey Icey')).toBeNull());
        await waitFor(() => expect(getByText('View Your Vans')).toBeTruthy());
    });

    it('handles unsuccessful deletion', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    van_id: '2',
                    van_nickname: 'Nicey Icey',
                    van_reg: 'NI09 ICE',
                },
                { 
                    van_id: '1',
                    van_nickname: 'Frosty Wheels',
                    van_reg: 'FW09 ICE',
                },
            ],
        });
        const { getByText, getByLabelText, getAllByLabelText } = render(<ViewVans />);
        await waitFor(() => expect(getByText('View Your Vans')).toBeTruthy());
        await waitFor(() => expect(getByText('Nicey Icey')).toBeTruthy());
    
        fireEvent.press(getAllByLabelText('delete-button')[0]);
    
        await waitFor(() => getByText("Are you sure you want to delete Nicey Icey?"));
        
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            new Promise(resolve =>
              
                resolve({
                    ok: false,
                    
                })
        ));
        fireEvent.press(getByLabelText('confirm-delete-button'));
    
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error deleting van details");            
        });
        consoleErrorSpy.mockRestore();
    });

    it('handles unsuccessful deletion and triggers catch block', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    van_id: '2',
                    van_nickname: 'Nicey Icey',
                    van_reg: 'NI09 ICE',
                },
            ],
        });
      
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
        const { getByText, getAllByLabelText, getByLabelText } = render(<ViewVans />);
      
        await waitFor(() => expect(getByText('View Your Vans')).toBeTruthy());
        await waitFor(() => expect(getByText('Nicey Icey')).toBeTruthy());
      
        fireEvent.press(getAllByLabelText('delete-button')[0]);
      
        await waitFor(() =>
            expect(getByText("Are you sure you want to delete Nicey Icey?")).toBeTruthy()
        );
      
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      
        fireEvent.press(getByLabelText('confirm-delete-button'));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining("Error deleting van:"),
                expect.anything() 
            );
        });
      
        consoleErrorSpy.mockRestore();
    });

    it('handles the close button being used in the modal', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    van_id: '2',
                    van_nickname: 'Nicey Icey',
                    van_reg: 'NI09 ICE',
                },
            ],
        });
      
        const { getByText, getAllByLabelText, getByLabelText } = render(<ViewVans />);
      
        await waitFor(() => expect(getByText('View Your Vans')).toBeTruthy());
        await waitFor(() => expect(getByText('Nicey Icey')).toBeTruthy());
        fireEvent.press(getByLabelText('edit-button'));
        await waitFor(() => expect(getByText('Van Registration Plate')).toBeTruthy());
        fireEvent.press(getByLabelText('close-button'));
        await waitFor(() => expect(getByText('View Your Vans')).toBeTruthy());
    });     
      
});
