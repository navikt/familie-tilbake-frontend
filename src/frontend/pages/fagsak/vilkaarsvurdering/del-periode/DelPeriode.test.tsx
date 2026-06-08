import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';

import { DelPeriode } from './DelPeriode';

const periode = {
    fom: '2024-01-01',
    tom: '2024-01-31',
};

const vilkårsperioder = [
    { fom: '2024-01-01', tom: '2024-01-14' },
    { fom: '2024-01-15', tom: '2024-01-31' },
];

const renderDelPeriode = (): void => {
    render(
        <QueryClientProvider client={createTestQueryClient()}>
            <TestBehandlingProvider>
                <DelPeriode
                    periode={periode}
                    vilkårsperioder={vilkårsperioder}
                    hentVilkårsvurdering={(): void => undefined}
                />
            </TestBehandlingProvider>
        </QueryClientProvider>
    );
};

const delOppKnapp = (): HTMLElement => screen.getByRole('button', { name: 'Del opp' });

describe('DelPeriode', () => {
    test('Skal vise modal når knapp trykkes', async () => {
        renderDelPeriode();

        delOppKnapp().click();

        expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    test('Skal vise innholdet i modal', async () => {
        renderDelPeriode();

        delOppKnapp().click();

        expect(await screen.findByText('Periode')).toBeInTheDocument();
        expect(screen.getByText('01.01.2024–31.01.2024')).toBeInTheDocument();

        const tidslinjeRad = screen.getByLabelText('01.01.2024 til 31.01.2024');
        expect(tidslinjeRad).toBeInTheDocument();
        expect(screen.getByText('Info fra 01.01.2024 til 14.01.2024')).toBeInTheDocument();
        expect(screen.getByText('Info fra 15.01.2024 til 31.01.2024')).toBeInTheDocument();

        expect(screen.getByLabelText('Velg dato')).toHaveValue('15.01.2024');

        expect(screen.getByRole('button', { name: 'Avbryt' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Del opp perioden' })).toBeInTheDocument();
    });

    // test('Skal vise to perioder i tidslinjen når dato er valgt', async () => {});

    // test('Skal vise feilmelding hvis man trykker del periode uten å velge dato', async () => {});
});
