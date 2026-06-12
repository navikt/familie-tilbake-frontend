import type { Periode } from '@/generated';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

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

type RenderDelPeriodeProps = {
    periodeProp?: Periode;
    vilkårsperioderProp?: Periode[];
    erVurdert?: boolean;
};

const renderDelPeriode = ({
    periodeProp = periode,
    vilkårsperioderProp = vilkårsperioder,
    erVurdert = false,
}: RenderDelPeriodeProps = {}): void => {
    render(
        <QueryClientProvider client={createTestQueryClient()}>
            <TestBehandlingProvider>
                <DelPeriode
                    periode={periodeProp}
                    vilkårsperioder={vilkårsperioderProp}
                    erVurdert={erVurdert}
                    hentVilkårsvurdering={(): void => undefined}
                />
            </TestBehandlingProvider>
        </QueryClientProvider>
    );
};

const delOppKnapp = (): HTMLElement => screen.getByRole('button', { name: 'Del opp' });
const delOppPeriodenKnapp = (): HTMLElement =>
    screen.getByRole('button', { name: 'Del opp perioden' });
const velgDatoTekst = 'Velg fra og med dato for periode 2';
const velgDatoDatePicker = (): HTMLElement => screen.getByLabelText(velgDatoTekst);

describe('DelPeriode', () => {
    test('Skal vise modal når knapp trykkes', async () => {
        renderDelPeriode();

        delOppKnapp().click();

        expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    test('Skal vise tidslinje, nye perioder, datepicker og knapper i modal', async () => {
        renderDelPeriode();

        delOppKnapp().click();

        const tidslinjeRad = await screen.findByLabelText('01.01.2024 til 31.01.2024');
        expect(tidslinjeRad).toBeInTheDocument();

        expect(screen.getByText('Periode 1')).toBeInTheDocument();
        expect(screen.getByText('01.01.2024–14.01.2024')).toBeInTheDocument();
        expect(screen.getByText('Periode 2')).toBeInTheDocument();
        expect(screen.getByText('15.01.2024–31.01.2024')).toBeInTheDocument();

        expect(velgDatoDatePicker()).toHaveValue('15.01.2024');

        expect(screen.getByRole('button', { name: 'Avbryt' })).toBeInTheDocument();
        expect(delOppPeriodenKnapp()).toBeInTheDocument();
    });

    test('Skal vise to perioder i tidslinjen', async () => {
        renderDelPeriode();

        delOppKnapp().click();

        expect(
            await screen.findByRole('button', { name: /Nøytral fra 01.01.2024 til 14.01.2024/ })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /Nøytral fra 15.01.2024 til 31.01.2024/ })
        ).toBeInTheDocument();
    });

    test('Skal vise feilmelding hvis man trykker del periode uten å velge dato', async () => {
        const user = userEvent.setup();
        renderDelPeriode();

        await user.click(delOppKnapp());

        const datoInput = await screen.findByLabelText(velgDatoTekst);
        await user.clear(datoInput);
        await user.click(delOppPeriodenKnapp());

        expect(screen.getByText('Du må velge en dato')).toBeInTheDocument();
    });

    test('Skal kun ha andre periode sin fom tilgjengelig i datepicker', async () => {
        const user = userEvent.setup();
        renderDelPeriode();

        await user.click(delOppKnapp());
        await user.click(await screen.findByRole('button', { name: 'Åpne datovelger' }));

        const dagKnapper = screen
            .getAllByRole('button')
            .filter((knapp): knapp is HTMLButtonElement => /^\d+$/.test(knapp.textContent ?? ''));
        const valgbareDager = dagKnapper.filter(knapp => !knapp.disabled);

        expect(valgbareDager).toHaveLength(1);
        expect(valgbareDager[0]).toHaveTextContent('15');
    });

    test('Skal filtrere vilkårsperioder som ligger utenfor perioden', async () => {
        const user = userEvent.setup();
        const periode = {
            fom: '2024-01-10',
            tom: '2024-01-25',
        };

        const vilkårsperioderMedPerioderUtenfor = [
            { fom: '2024-01-01', tom: '2024-01-09' }, // Før perioden
            { fom: '2024-01-10', tom: '2024-01-17' }, // Innenfor
            { fom: '2024-01-18', tom: '2024-01-25' }, // Innenfor
            { fom: '2024-01-26', tom: '2024-01-31' }, // Etter perioden
        ] satisfies Periode[];

        renderDelPeriode({
            periodeProp: periode,
            vilkårsperioderProp: vilkårsperioderMedPerioderUtenfor,
        });

        await user.click(delOppKnapp());

        // Skal bare vise de to periodene innenfor
        expect(screen.getByText('Periode 1')).toBeInTheDocument();
        expect(screen.getByText('10.01.2024–17.01.2024')).toBeInTheDocument();
        expect(screen.getByText('Periode 2')).toBeInTheDocument();
        expect(screen.getByText('18.01.2024–25.01.2024')).toBeInTheDocument();

        // Skal ikke inneholde periodene utenfor
        expect(screen.queryByText('01.01.2024–09.01.2024')).not.toBeInTheDocument();
        expect(screen.queryByText('26.01.2024–31.01.2024')).not.toBeInTheDocument();

        // standardSplittDato skal være den andre filtrerte perioden
        expect(velgDatoDatePicker()).toHaveValue('18.01.2024');
    });

    test('Skal vise "Vurdert" i popover for periode 1 når perioden er vurdert', async () => {
        const user = userEvent.setup();
        renderDelPeriode({ erVurdert: true });

        await user.click(delOppKnapp());

        const periode1Knapp = await screen.findByRole('button', {
            name: /Suksess fra 01.01.2024 til 14.01.2024/,
        });
        await user.click(periode1Knapp);

        expect(await screen.findByText('Vurdert')).toBeInTheDocument();
    });

    test('Skal vise "Ikke vurdert" i popover for periode 1 når perioden ikke er vurdert', async () => {
        const user = userEvent.setup();
        renderDelPeriode({ erVurdert: false });

        await user.click(delOppKnapp());

        const periode1Knapp = await screen.findByRole('button', {
            name: /Nøytral fra 01.01.2024 til 14.01.2024/,
        });
        await user.click(periode1Knapp);

        expect(await screen.findByText('Ikke vurdert')).toBeInTheDocument();
    });

    test('Skal vise "Ikke vurdert" i popover for periode 2 alltid', async () => {
        const user = userEvent.setup();
        renderDelPeriode({ erVurdert: true });

        await user.click(delOppKnapp());

        const periode2Knapp = await screen.findByRole('button', {
            name: /Nøytral fra 15.01.2024 til 31.01.2024/,
        });
        await user.click(periode2Knapp);

        expect(await screen.findByText('Ikke vurdert')).toBeInTheDocument();
    });
});
