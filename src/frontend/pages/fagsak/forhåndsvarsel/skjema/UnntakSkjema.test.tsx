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
    lagForhåndsvarselMutations,
} from '../../../../testdata/forhåndsvarselFactory';
import { createTestQueryClient } from '../../../../testutils/queryTestUtils';
import { configureZod } from '../../../../utils/zodConfig';
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

beforeAll(() => {
    configureZod();
});

const renderUnntak = (): RenderResult => {
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

    fireEvent.click(screen.getByLabelText('Nei'));

    return result;
};

describe('Unntak', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useForhåndsvarselQueries).mockReturnValue(lagForhåndsvarselQueries());
        vi.mocked(useForhåndsvarselMutations).mockReturnValue(lagForhåndsvarselMutations());
    });

    test('Viser alle tre unntaksalternativer', () => {
        renderUnntak();

        expect(
            screen.getByLabelText(
                /Varsling er ikke praktisk mulig eller vil hindre gjennomføring av vedtaket/
            )
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText(
                /Mottaker av varselet har ukjent adresse og ettersporing er urimelig ressurskrevende/
            )
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText(
                /Varsel anses som åpenbart unødvendig eller mottaker av varselet er allerede kjent med saken/
            )
        ).toBeInTheDocument();
    });

    test('Viser feilmeldinger ved ingen valg av unntak eller begrunnelse', async () => {
        renderUnntak();

        const nesteKnapp = screen.getByRole('button', { name: 'Lagre og gå til neste' });
        fireEvent.click(nesteKnapp);

        const unntakFeilmelding = await screen.findByText(
            'Du må velge en begrunnelse for unntak fra forhåndsvarsel'
        );
        expect(unntakFeilmelding).toBeInTheDocument();

        const beskrivelseFeilmelding = await screen.findByText('Du må fylle inn en verdi');
        expect(beskrivelseFeilmelding).toBeInTheDocument();
    });
});
