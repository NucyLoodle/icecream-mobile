import React from 'react';
import 'react-native';
import { render, fireEvent, screen } from '@testing-library/react-native';
import ChooseVan from '../ChooseVan';

describe('ChooseVan Component', () => {

    it('renders correctly', () => {
        render(<ChooseVan />);
        expect(screen.getByText('Available Vans')).toBeTruthy();
    });
})
