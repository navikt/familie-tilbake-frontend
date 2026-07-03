import type { SammenslåbarPeriode } from './utils';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';

import { SlåSammen } from './SlåSammen';

const vilkårsperioder: SammenslåbarPeriode[] = [
    {
        periodeId: '1',
        periode: { fom: '2024-01-01', tom: '2024-01-31' },
        delbarePerioder: [{ periodeId: '1', periode: { fom: '2024-01-01', tom: '2024-01-31' } }],
    },
    {
        periodeId: '2',
        periode: { fom: '2024-02-01', tom: '2024-02-29' },
        delbarePerioder: [{ periodeId: '2', periode: { fom: '2024-02-01', tom: '2024-02-29' } }],
    },
    {
        periodeId: '3',
        periode: { fom: '2024-03-01', tom: '2024-03-31' },
        delbarePerioder: [{ periodeId: '3', periode: { fom: '2024-03-01', tom: '2024-03-31' } }],
    },
];

type RenderSlåSammenProps = {
    vilkårsvurderingIdProp?: string;
    vilkårsperioderProp?: SammenslåbarPeriode[];
};

const renderSlåSammen = ({
    vilkårsvurderingIdProp = '2',
    vilkårsperioderProp = vilkårsperioder,
}: RenderSlåSammenProps = {}): void => {
    render(
        <QueryClientProvider client={createTestQueryClient()}>
            <TestBehandlingProvider>
                <SlåSammen
                    vilkårsvurderingId={vilkårsvurderingIdProp}
                    vilkårsperioder={vilkårsperioderProp}
                    hentVilkårsvurdering={(): void => undefined}
                />
            </TestBehandlingProvider>
        </QueryClientProvider>
    );
};

const åpneKnapp = (): HTMLElement => screen.getByRole('button', { name: 'Slå sammen' });
const slåSammenKnapp = (): HTMLElement =>
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Slå sammen' });

describe('SlåSammen', () => {
    test('Skal vise modal når knapp trykkes', async () => {
        renderSlåSammen();

        åpneKnapp().click();

        expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    test('Skal vise forrige (eldre) periode som perioden slås sammen med i dialogen', async () => {
        const user = userEvent.setup();
        renderSlåSammen({ vilkårsvurderingIdProp: '2' });

        await user.click(åpneKnapp());

        expect(
            await within(screen.getByRole('dialog')).findByText('01.01.2024–31.01.2024')
        ).toBeInTheDocument();
    });

    test('Skal sammenslå med nærmeste periode uavhengig av rekkefølge i input', async () => {
        const user = userEvent.setup();
        renderSlåSammen({
            vilkårsvurderingIdProp: '3',
            vilkårsperioderProp: [vilkårsperioder[2], vilkårsperioder[0], vilkårsperioder[1]],
        });

        await user.click(åpneKnapp());

        expect(
            await within(screen.getByRole('dialog')).findByText('01.02.2024–29.02.2024')
        ).toBeInTheDocument();
    });

    test('Skal ikke vise slå sammen-knapp for den eldste (første) perioden', () => {
        renderSlåSammen({ vilkårsvurderingIdProp: '1' });

        expect(screen.queryByRole('button', { name: 'Slå sammen' })).not.toBeInTheDocument();
    });

    test('Skal vise avbryt- og slå sammen-knapp i modal', async () => {
        const user = userEvent.setup();
        renderSlåSammen();

        await user.click(åpneKnapp());

        expect(screen.getByRole('button', { name: 'Avbryt' })).toBeInTheDocument();
        expect(slåSammenKnapp()).toBeInTheDocument();
    });
});
