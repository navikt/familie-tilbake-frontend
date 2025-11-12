import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { RenderResult } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { Forhåndsvarsel } from './Forhåndsvarsel';
import { lagBehandlingDto } from '../../../testdata/behandlingFactory';
import { lagFagsakDto } from '../../../testdata/fagsakFactory';

const mockUseBehandling = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

jest.mock('../../../generated/@tanstack/react-query.gen', () => ({
    bestillBrevMutation: jest.fn().mockReturnValue({
        mutationFn: jest.fn(),
    }),
    forhåndsvisBrevMutation: jest.fn().mockReturnValue({
        mutationFn: jest.fn(),
    }),
}));

jest.mock('../../../generated', () => ({
    BrevmalkodeEnum: {
        VARSEL: 'VARSEL',
    },
    hentForhåndsvarselTekst: jest.fn().mockResolvedValue({
        data: {
            data: {
                overskrift: 'Nav vurderer om du må betale tilbake overgangsstønad',
                avsnitter: [
                    {
                        title: 'Test avsnitt',
                        body: 'Test innhold',
                    },
                ],
            },
        },
    }),
}));

const setupMock = (): void => {
    mockUseBehandling.mockImplementation(() => ({
        actionBarStegtekst: jest.fn().mockReturnValue('Steg 2 av 5'),
        erStegBehandlet: jest.fn().mockReturnValue(false),
    }));
};

const renderForhåndsvarsel = (): RenderResult =>
    render(
        <QueryClientProvider client={new QueryClient()}>
            <Forhåndsvarsel behandling={lagBehandlingDto()} fagsak={lagFagsakDto()} />
        </QueryClientProvider>
    );

describe('Forhåndsvarsel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupMock();
    });

    test('Viser alle alternativene', () => {
        renderForhåndsvarsel();

        expect(screen.getByLabelText('Ja')).toBeInTheDocument();
        expect(screen.getByLabelText('Nei')).toBeInTheDocument();
    });

    test('Viser flyt for Opprett forhåndsvarsel når man velger Ja', async () => {
        renderForhåndsvarsel();

        expect(screen.queryByText(/Opprett forhåndsvarsel/)).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Ja'));

        expect(await screen.findByText(/Opprett forhåndsvarsel/)).toBeInTheDocument();
        expect(
            await screen.findByRole('heading', {
                name: /Nav vurderer om du må betale tilbake overgangsstønad/i,
            })
        ).toBeInTheDocument();
    });

    test('Viser fritekstfelt når bruker har valgt Ja', async () => {
        renderForhåndsvarsel();
        fireEvent.click(screen.getByLabelText('Ja'));

        expect(await screen.findByLabelText(/Legg til utdypende tekst/)).toBeInTheDocument();
    });

    test('Viser flyt for Velg begrunnelse for unntak fra forhåndsvarsel når man velger Nei', () => {
        renderForhåndsvarsel();
        expect(
            screen.queryByText(/Velg begrunnelse for unntak fra forhåndsvarsel/)
        ).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Nei'));

        expect(
            screen.getByRole('group', {
                name: /Velg begrunnelse for unntak fra forhåndsvarsel/,
            })
        ).toBeInTheDocument();
    });

    test('Viser alternativer for unntak når bruker har valgt Nei', () => {
        renderForhåndsvarsel();
        fireEvent.click(screen.getByLabelText('Nei'));

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
                /Varsel anses som åpenbart unødvendig eller mottaker av varselet er allerede kjent med saken og har hatt mulighet til å uttale seg/
            )
        ).toBeInTheDocument();
    });
});
