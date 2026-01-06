import type { BehandlingHook } from '../../../../context/BehandlingContext';
import type { Toggles } from '../../../../context/toggles';
import type { RenderResult } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';

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

const mockUseBehandling = jest.fn();
const mockUseToggles = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

jest.mock('../../../../context/TogglesContext', () => ({
    useToggles: (): Toggles => mockUseToggles(),
}));

jest.mock('../../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

jest.mock('../../../../generated/@tanstack/react-query.gen', () => ({
    bestillBrevMutation: jest.fn().mockReturnValue({
        mutationFn: jest.fn(),
    }),
    forhåndsvisBrevMutation: jest.fn().mockReturnValue({
        mutationFn: jest.fn(),
    }),
}));

jest.mock('../useForhåndsvarselQueries', () => ({
    useForhåndsvarselQueries: jest.fn(),
}));

jest.mock('../useForhåndsvarselMutations', () => ({
    useForhåndsvarselMutations: jest.fn(),
    mapHarBrukerUttaltSegFraApiDto: jest.fn(),
}));

jest.mock('../../../../generated', () => ({
    BrevmalkodeEnum: {
        VARSEL: 'VARSEL',
    },
}));

const setupMock = (): void => {
    mockUseBehandling.mockImplementation(() => ({
        actionBarStegtekst: jest.fn().mockReturnValue('Steg 2 av 5'),
        erStegBehandlet: jest.fn().mockReturnValue(false),
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
    jest.mocked(useForhåndsvarselQueries).mockReturnValue(lagForhåndsvarselQueriesSendt());

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
        jest.clearAllMocks();
        setupMock();

        jest.mocked(useForhåndsvarselQueries).mockReturnValue(lagForhåndsvarselQueries());
        jest.mocked(useForhåndsvarselMutations).mockReturnValue(lagForhåndsvarselMutations());
    });

    test('Viser riktig tittel når varsel ikke er sendt', async () => {
        renderForhåndsvarselSkjema();

        expect(
            await screen.findByRole('heading', {
                name: 'Opprett forhåndsvarsel',
                level: 3,
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

    test('Viser forhåndsvisning knapp når varsel ikke er sendt', async () => {
        renderForhåndsvarselSkjema();

        expect(await screen.findByRole('button', { name: 'Forhåndsvisning' })).toBeInTheDocument();
    });

    test('Viser Brukeruttalelse når varsel er sendt', async () => {
        renderForhåndsvarselSkjemaSendt();

        expect(
            await screen.findByText('Har brukeren uttalt seg etter forhåndsvarselet?')
        ).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Forhåndsvisning' })).not.toBeInTheDocument();
    });
});
