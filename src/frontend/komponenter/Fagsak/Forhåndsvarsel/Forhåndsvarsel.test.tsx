import type { DokumentApiHook } from '../../../api/dokument';
import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { Behandling } from '../../../typer/behandling';
import type { Fagsak } from '../../../typer/fagsak';
import type { RenderResult } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { Forhåndsvarsel } from './Forhåndsvarsel';

const mockUseBehandling = jest.fn();
const mockUseDokumentlisting = jest.fn();
const mockUseDokumentApi = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));
jest.mock('../../../api/dokument', () => ({
    useDokumentApi: (): DokumentApiHook =>
        mockUseDokumentApi(
            jest.fn().mockReturnValue({ bestillBrev: jest.fn(), forhåndsvisBrev: jest.fn() })
        ),
}));
jest.mock('../Høyremeny/Dokumentlisting/DokumentlistingContext', () => ({
    useDokumentlisting: (): DokumentApiHook => mockUseDokumentlisting(),
}));

const createMockBehandling = {
    behandlingId: '1',
    eksternBrukId: '123',
    varselSendt: false,
} as unknown as Behandling;

const createMockFagsak = {
    fagsystem: 'EF',
    eksternFagsakId: '456',
} as unknown as Fagsak;

const setupMock = (): void => {
    mockUseBehandling.mockImplementation(() => ({
        actionBarStegtekst: jest.fn().mockReturnValue('Steg 1 av 5'),
        harVærtPåFatteVedtakSteget: jest.fn().mockReturnValue(false),
        åpenHøyremeny: jest.fn(),
    }));

    mockUseDokumentApi.mockReturnValue({
        bestillBrev: jest.fn(),
        forhåndsvisBrev: jest.fn(),
    });
};

const renderForhåndsvarsel = (
    behandling: Behandling = createMockBehandling,
    fagsak: Fagsak = createMockFagsak
): RenderResult => {
    return render(<Forhåndsvarsel behandling={behandling} fagsak={fagsak} />);
};

describe('Forhåndsvarsel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupMock();
    });

    it('viser alle alternativene', () => {
        renderForhåndsvarsel();

        expect(screen.getByLabelText('Ja')).toBeInTheDocument();
        expect(screen.getByLabelText('Nei')).toBeInTheDocument();
        expect(screen.getByLabelText('Forhåndsvarsel er allerede sendt')).toBeInTheDocument();
    });

    it('viser flyt for Opprett forhåndsvarsel når man velger Ja', () => {
        renderForhåndsvarsel();
        expect(screen.queryByText(/Opprett forhåndsvarsel/)).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Ja'));

        expect(screen.getByText(/Opprett forhåndsvarsel/)).toBeInTheDocument();
        expect(
            screen.getByRole('heading', {
                name: /Nav vurderer om du må betale tilbake overgangsstønad/i,
            })
        ).toBeInTheDocument();
    });

    it('viser fritekstfelt når bruker har valgt Ja', () => {
        renderForhåndsvarsel();
        fireEvent.click(screen.getByLabelText('Ja'));

        expect(screen.getByLabelText(/Legg til utdypende tekst/)).toBeInTheDocument();
    });
});
