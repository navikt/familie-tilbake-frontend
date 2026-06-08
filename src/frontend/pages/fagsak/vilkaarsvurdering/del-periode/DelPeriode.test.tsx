import { render, screen } from '@testing-library/react';

import { DelPeriode } from './DelPeriode';

const periode = {
    fom: '2024-01-01',
    tom: '2024-01-31',
};

const delOppKnapp = (): HTMLElement => screen.getByRole('button', { name: 'Del opp' });

describe('DelPeriode', () => {
    test('Skal vise modal når knapp trykkes', async () => {
        render(<DelPeriode periode={periode} />);

        delOppKnapp().click();

        expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    test('Skal vise innholdet i modal', async () => {
        render(<DelPeriode periode={periode} />);

        delOppKnapp().click();

        expect(await screen.findByText('Periode')).toBeInTheDocument();
        expect(screen.getByText('01.01.2024–31.01.2024')).toBeInTheDocument();

        const timelineTekst = screen.getByLabelText('01.01.2024 til 31.01.2024');
        expect(timelineTekst).toBeInTheDocument();

        expect(screen.getByLabelText('Velg dato')).toHaveValue('01.01.2024');

        expect(screen.getByRole('button', { name: 'Avbryt' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Del opp perioden' })).toBeInTheDocument();
    });

    // test('Skal vise to perioder i tidslinjen når dato er valgt', async () => {});

    // test('Skal vise feilmelding hvis man trykker del periode uten å velge dato', async () => {});
});
