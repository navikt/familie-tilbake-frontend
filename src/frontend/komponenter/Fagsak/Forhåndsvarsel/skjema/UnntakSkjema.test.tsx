import type { BehandlingHook } from '../../../../context/BehandlingContext';
import type { RenderResult } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { FagsakContext } from '../../../../context/FagsakContext';
import { ToggleName, type Toggles } from '../../../../context/toggles';
import { lagBehandlingDto } from '../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';
import {
    lagForhåndsvarselQueries,
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

const renderUnntak = (): RenderResult => {
    const fagsakValue = { fagsak: lagFagsak() };
    const result = render(
        <FagsakContext.Provider value={fagsakValue}>
            <QueryClientProvider client={new QueryClient()}>
                <Forhåndsvarsel behandling={lagBehandlingDto()} />
            </QueryClientProvider>
        </FagsakContext.Provider>
    );

    fireEvent.click(screen.getByLabelText('Nei'));

    return result;
};

describe('Unntak', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupMock();

        jest.mocked(useForhåndsvarselQueries).mockReturnValue(lagForhåndsvarselQueries());
        jest.mocked(useForhåndsvarselMutations).mockReturnValue(lagForhåndsvarselMutations());
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

        const nesteKnapp = screen.getByRole('button', { name: 'Send inn unntak' });
        fireEvent.click(nesteKnapp);

        const unntakFeilmelding = await screen.findByText(
            'Du må velge en begrunnelse for unntak fra forhåndsvarsel'
        );
        expect(unntakFeilmelding).toBeInTheDocument();

        const beskrivelseFeilmelding = await screen.findByText('Du må fylle inn en verdi');
        expect(beskrivelseFeilmelding).toBeInTheDocument();
    });
});
