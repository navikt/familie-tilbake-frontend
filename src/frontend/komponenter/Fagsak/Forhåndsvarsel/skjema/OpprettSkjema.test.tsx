import type { RenderResult } from '@testing-library/react';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { FagsakContext } from '../../../../context/FagsakContext';
import { TestBehandlingProvider } from '../../../../testdata/behandlingContextFactory';
import { lagBehandlingDto } from '../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';
import {
    lagForhåndsvarselQueries,
    lagForhåndsvarselQueriesSendt,
    lagForhåndsvarselMutations,
} from '../../../../testdata/forhåndsvarselFactory';
import { createTestQueryClient } from '../../../../testutils/queryTestUtils';
import { Forhåndsvarsel } from '../Forhåndsvarsel';
import { useForhåndsvarselMutations } from '../useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from '../useForhåndsvarselQueries';

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
        <FagsakContext.Provider value={lagFagsak()}>
            <TestBehandlingProvider behandling={behandling}>
                <QueryClientProvider client={createTestQueryClient()}>
                    <Forhåndsvarsel />
                </QueryClientProvider>
            </TestBehandlingProvider>
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

    const behandling = lagBehandlingDto();
    const result = render(
        <FagsakContext.Provider value={lagFagsak()}>
            <TestBehandlingProvider behandling={behandling}>
                <QueryClientProvider client={createTestQueryClient()}>
                    <Forhåndsvarsel />
                </QueryClientProvider>
            </TestBehandlingProvider>
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
