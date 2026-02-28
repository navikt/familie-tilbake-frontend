import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Landvelger } from './Landvelger';

const mockHåndterLandValgt = vi.fn();
vi.mock('countries-list', () => ({
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
        const user = userEvent.setup();
        render(
            <Landvelger
                id="landvelger-test"
                valgtLandkode="NO"
                håndterLandValgt={mockHåndterLandValgt}
                eksluderLandkoder={['SE']}
            />
        );

        const combobox = screen.getByRole('combobox');
        await user.click(combobox);

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
