import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import Landvelger from './Landvelger';

const mockHåndterLandValgt = jest.fn();
jest.mock('countries-list', () => ({
    countries: {
        NO: { name: 'Norge' },
        SE: { name: 'Sverige' },
        DK: { name: 'Danmark' },
        FI: { name: 'Finland' },
    },
}));

describe('Landvelger', () => {
    test('Vises uten å krasje', () => {
        render(
            <Landvelger
                id="landvelger-test"
                valgtLandkode="NO"
                håndterLandValgt={mockHåndterLandValgt}
            />
        );
        expect(screen.getByText('Land')).toBeInTheDocument();
    });

    test('Ekskluderer spesifiserte landkoder', async () => {
        render(
            <Landvelger
                id="landvelger-test"
                valgtLandkode="NO"
                håndterLandValgt={mockHåndterLandValgt}
                eksluderLandkoder={['SE']}
            />
        );

        const combobox = screen.getByRole('combobox');
        fireEvent.click(combobox);

        const danmarkValg = await screen.findByText('Danmark');
        expect(danmarkValg).toBeInTheDocument();

        expect(screen.queryByText('Sverige')).not.toBeInTheDocument();
    });

    test('Viser feilmelding når det finnes', () => {
        const errorMessage = 'Eksempel på feilmelding';
        render(
            <Landvelger
                id="landvelger-test"
                valgtLandkode="NO"
                håndterLandValgt={mockHåndterLandValgt}
                error={errorMessage}
            />
        );

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
});
