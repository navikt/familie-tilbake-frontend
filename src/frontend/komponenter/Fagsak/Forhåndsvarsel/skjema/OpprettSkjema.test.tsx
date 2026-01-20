import type { BehandlingHook } from '../../../../context/BehandlingContext';
import type { Toggles } from '../../../../context/toggles';
import type { RenderResult } from '@testing-library/react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { FagsakContext } from '../../../../context/FagsakContext';
import { ToggleName } from '../../../../context/toggles';
import { lagBehandlingDto } from '../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';
import {
    lagForhåndsvarselQueries,
    lagForhåndsvarselQueriesSendt,
    lagForhåndsvarselMutations,
} from '../../../../testdata/forhåndsvarselFactory';
import { Forhåndsvarsel } from '../Forhåndsvarsel';
import { useForhåndsvarselMutations } from '../useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from '../useForhåndsvarselQueries';

const mockUseBehandling = vi.fn();
const mockUseToggles = vi.fn();

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: (): ReturnType<typeof vi.fn> => vi.fn(),
    };
});

vi.mock('../../../../context/TogglesContext', () => ({
    useToggles: (): Toggles => mockUseToggles(),
}));

vi.mock('../../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

vi.mock('../useForhåndsvarselQueries', () => ({
    useForhåndsvarselQueries: vi.fn(),
}));

vi.mock('../useForhåndsvarselMutations', () => ({
    useForhåndsvarselMutations: vi.fn(),
    mapHarBrukerUttaltSegFraApiDto: vi.fn(),
}));

const setupMock = (): void => {
    mockUseBehandling.mockImplementation(() => ({
        actionBarStegtekst: vi.fn().mockReturnValue('Steg 2 av 5'),
        erStegBehandlet: vi.fn().mockReturnValue(false),
    }));
    mockUseToggles.mockImplementation(() => ({
        toggles: {
            [ToggleName.Forhåndsvarselsteg]: true,
        },
    }));
};

const renderForhåndsvarselSkjema = (): RenderResult => {
    const result = render(
        <FagsakContext.Provider value={lagFagsak()}>
            <QueryClientProvider client={new QueryClient()}>
                <Forhåndsvarsel behandling={lagBehandlingDto()} />
            </QueryClientProvider>
        </FagsakContext.Provider>
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

    const result = render(
        <FagsakContext.Provider value={lagFagsak()}>
            <QueryClientProvider client={new QueryClient()}>
                <Forhåndsvarsel behandling={lagBehandlingDto()} />
            </QueryClientProvider>
        </FagsakContext.Provider>
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
        setupMock();

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
            await screen.findByText('Har brukeren uttalt seg etter forhåndsvarselet?')
        ).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Forhåndsvisning' })).not.toBeInTheDocument();
    });
});
