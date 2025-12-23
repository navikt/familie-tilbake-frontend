import type { BehandlingHook } from '../../../../context/BehandlingContext';
import type { RenderResult } from '@testing-library/react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ToggleName, type Toggles } from '../../../../context/toggles';
import { lagBehandlingDto } from '../../../../testdata/behandlingFactory';
import { lagFagsakDto } from '../../../../testdata/fagsakFactory';
import {
    lagForhåndsvarselQueries,
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

vi.mock('../../../../generated/@tanstack/react-query.gen', () => ({
    bestillBrevMutation: vi.fn().mockReturnValue({
        mutationFn: vi.fn(),
    }),
    forhåndsvisBrevMutation: vi.fn().mockReturnValue({
        mutationFn: vi.fn(),
    }),
}));

vi.mock('../useForhåndsvarselQueries', () => ({
    useForhåndsvarselQueries: vi.fn(),
}));

vi.mock('../useForhåndsvarselMutations', () => ({
    useForhåndsvarselMutations: vi.fn(),
    mapHarBrukerUttaltSegFraApiDto: vi.fn(),
}));

vi.mock('../../../../generated', () => ({
    BrevmalkodeEnum: {
        VARSEL: 'VARSEL',
    },
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

const renderUnntak = (): RenderResult => {
    const result = render(
        <QueryClientProvider client={new QueryClient()}>
            <Forhåndsvarsel behandling={lagBehandlingDto()} fagsak={lagFagsakDto()} />
        </QueryClientProvider>
    );

    fireEvent.click(screen.getByLabelText('Nei'));

    return result;
};

describe('Unntak', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupMock();

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
