import type { RenderResult } from '@testing-library/react';
import type { FaktaOmFeilutbetaling } from '~/generated-new';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { FagsakContext } from '~/context/FagsakContext';
import { behandlingFaktaQueryKey } from '~/generated-new/@tanstack/react-query.gen';
import { Forhåndsvarsel } from '~/pages/fagsak/forhåndsvarsel/Forhåndsvarsel';
import { useForhåndsvarselMutations } from '~/pages/fagsak/forhåndsvarsel/useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from '~/pages/fagsak/forhåndsvarsel/useForhåndsvarselQueries';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagBehandlingDto } from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import {
    lagForhåndsvarselQueries,
    lagForhåndsvarselQueriesSendt,
    lagForhåndsvarselMutations,
} from '~/testdata/forhåndsvarselFactory';
import { createTestQueryClient } from '~/testutils/queryTestUtils';

vi.mock('../useForhåndsvarselQueries', () => ({
    useForhåndsvarselQueries: vi.fn(),
}));

vi.mock('../useForhåndsvarselMutations', () => ({
    useForhåndsvarselMutations: vi.fn(),
    mapHarBrukerUttaltSegFraApiDto: vi.fn(),
}));

const renderForhåndsvarselSkjema = (): RenderResult => {
    const behandling = lagBehandlingDto();
    const result = render(
        <FagsakContext value={lagFagsak()}>
            <TestBehandlingProvider behandling={behandling}>
                <QueryClientProvider client={createTestQueryClient()}>
                    <Forhåndsvarsel />
                </QueryClientProvider>
            </TestBehandlingProvider>
        </FagsakContext>
    );

    const sendForhåndsvarselFieldset = screen
        .getByText('Skal det sendes forhåndsvarsel om tilbakekreving?')
        .closest('fieldset');
    if (!sendForhåndsvarselFieldset) throw new Error('Could not find fieldset');
    const jaRadioButton = sendForhåndsvarselFieldset.querySelector('input[value="ja"]');
    if (!jaRadioButton) throw new Error('Could not find "Ja" radio button');
    fireEvent.click(jaRadioButton);

    return result;
};

const renderForhåndsvarselSkjemaSendt = (): RenderResult => {
    vi.mocked(useForhåndsvarselQueries).mockReturnValue(lagForhåndsvarselQueriesSendt());

    const behandling = lagBehandlingDto();
    const result = render(
        <FagsakContext value={lagFagsak()}>
            <TestBehandlingProvider behandling={behandling}>
                <QueryClientProvider client={createTestQueryClient()}>
                    <Forhåndsvarsel />
                </QueryClientProvider>
            </TestBehandlingProvider>
        </FagsakContext>
    );

    const sendForhåndsvarselFieldset = screen
        .getByText('Skal det sendes forhåndsvarsel om tilbakekreving?')
        .closest('fieldset');
    if (!sendForhåndsvarselFieldset) throw new Error('Could not find fieldset');
    const jaRadioButton = sendForhåndsvarselFieldset.querySelector('input[value="ja"]');
    if (!jaRadioButton) throw new Error('Could not find "Ja" radio button');
    fireEvent.click(jaRadioButton);

    return result;
};

describe('ForhåndsvarselSkjema', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useForhåndsvarselQueries).mockReturnValue(lagForhåndsvarselQueries());
        vi.mocked(useForhåndsvarselMutations).mockReturnValue(lagForhåndsvarselMutations());
    });

    test('Viser riktig tittel når varsel ikke er sendt', async () => {
        renderForhåndsvarselSkjema();

        expect(
            await screen.findByRole('heading', {
                name: 'Opprett forhåndsvarsel',
                level: 2,
            })
        ).toBeInTheDocument();
    });

    test('Viser riktig tittel når varsel er sendt', async () => {
        renderForhåndsvarselSkjemaSendt();

        expect(
            await screen.findByRole('heading', { name: 'Forhåndsvarsel', level: 1 })
        ).toBeInTheDocument();
    });

    test('Viser brevinnhold og fritekstfelt', async () => {
        renderForhåndsvarselSkjema();

        expect(await screen.findByText('Dette har skjedd')).toBeInTheDocument();
        expect(screen.getByText('Legg til utdypende tekst')).toBeInTheDocument();
    });

    test('Viser Brukeruttalelse når varsel er sendt', async () => {
        renderForhåndsvarselSkjemaSendt();

        expect(
            await screen.findByText('Har brukeren uttalt seg etter forhåndsvarselet ble sendt?')
        ).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Forhåndsvisning' })).not.toBeInTheDocument();
    });
});

const lagFaktaOmFeilutbetaling = (vedtaksdato: string): FaktaOmFeilutbetaling =>
    ({
        feilutbetaling: {
            beløp: 10000,
            fom: '2025-01-01',
            tom: '2025-06-30',
            revurdering: {
                årsak: 'Endring i inntekt',
                vedtaksdato,
                resultat: 'OPPHØRT',
            },
        },
        tidligereVarsletBeløp: null,
        muligeRettsligGrunnlag: [],
        perioder: [],
        vurdering: { årsak: null },
        ferdigvurdert: false,
    }) satisfies FaktaOmFeilutbetaling;

const renderMedFaktaData = (vedtaksdato: string): RenderResult => {
    const behandling = lagBehandlingDto();
    const queryClient = createTestQueryClient();

    const queryKey = behandlingFaktaQueryKey({
        path: { behandlingId: behandling.behandlingId },
    });
    queryClient.setQueryData(queryKey, lagFaktaOmFeilutbetaling(vedtaksdato));

    const renderForhåndsvarsel = render(
        <FagsakContext value={lagFagsak()}>
            <TestBehandlingProvider behandling={behandling}>
                <QueryClientProvider client={queryClient}>
                    <Forhåndsvarsel />
                </QueryClientProvider>
            </TestBehandlingProvider>
        </FagsakContext>
    );

    const fieldset = screen
        .getByText('Skal det sendes forhåndsvarsel om tilbakekreving?')
        .closest('fieldset');
    if (!fieldset) throw new Error('Could not find fieldset');
    const jaRadioButton = fieldset.querySelector('input[value="ja"]');
    if (!jaRadioButton) throw new Error('Could not find "Ja" radio button');
    fireEvent.click(jaRadioButton);

    return renderForhåndsvarsel;
};

describe('Stønadstekst', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useForhåndsvarselQueries).mockReturnValue(lagForhåndsvarselQueries());
        vi.mocked(useForhåndsvarselMutations).mockReturnValue(lagForhåndsvarselMutations());
    });

    test('Initialiserer fritekst med stønadstekst basert på vedtaksdato', async () => {
        const { getByRole } = renderMedFaktaData('2025-09-05');

        await waitFor(() => {
            expect(getByRole('textbox', { name: 'Legg til utdypende tekst' })).toHaveValue(
                'Det er gjort en endring i saken din 5. september 2025. Dette gjør at tidligere utbetalinger ikke lenger er riktige, og at du har fått utbetalt for mye.'
            );
        });
    });

    test('Overskriver ikke fritekst som brukeren har skrevet', async () => {
        const { getByRole } = renderMedFaktaData('2025-09-05');

        const textarea = getByRole('textbox', { name: 'Legg til utdypende tekst' });
        await waitFor(() => {
            expect(textarea).toHaveValue(
                'Det er gjort en endring i saken din 5. september 2025. Dette gjør at tidligere utbetalinger ikke lenger er riktige, og at du har fått utbetalt for mye.'
            );
        });

        fireEvent.change(textarea, { target: { value: 'Egendefinert tekst' } });
        expect(textarea).toHaveValue('Egendefinert tekst');
    });
});
