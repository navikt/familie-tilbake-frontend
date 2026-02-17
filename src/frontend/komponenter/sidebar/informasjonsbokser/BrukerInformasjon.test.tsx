import type { InstitusjonDto } from '../../../generated';
import type { FrontendBrukerDto } from '../../../generated';
import type { RenderResult } from '@testing-library/react';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { BrukerInformasjon } from './BrukerInformasjon';
import { FagsakContext } from '../../../context/FagsakContext';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import { Kjønn } from '../../../typer/bruker';

vi.mock('../../../utils', async () => {
    const actual = await vi.importActual('../../../utils');
    return {
        ...actual,
        hentAlder: vi.fn(() => 42),
    };
});

const baseBruker = (override: Partial<FrontendBrukerDto> = {}): FrontendBrukerDto => ({
    navn: 'Ola Nordmann',
    fødselsdato: '1990-05-17',
    dødsdato: undefined,
    kjønn: Kjønn.Mann,
    personIdent: '01020312345',
    ...override,
});

const baseInstitusjon = (override: Partial<InstitusjonDto> = {}): InstitusjonDto => ({
    navn: 'Solgløtt Omsorg',
    organisasjonsnummer: '123456789',
    ...override,
});

const renderBrukerInformasjon = (
    bruker: Partial<FrontendBrukerDto> | null = null,
    institusjon: Partial<InstitusjonDto> | null = null
): RenderResult => {
    return render(
        <FagsakContext.Provider
            value={lagFagsak({
                bruker: bruker ? baseBruker(bruker) : baseBruker(),
                institusjon: institusjon ? baseInstitusjon(institusjon) : undefined,
            })}
        >
            <BrukerInformasjon />
        </FagsakContext.Provider>
    );
};

describe('BrukerInformasjon', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Viser heading', () => {
        renderBrukerInformasjon();
        expect(screen.getByRole('heading', { name: 'Informasjon om bruker' })).toBeInTheDocument();
    });

    test('Viser navn', () => {
        renderBrukerInformasjon({ navn: 'Kari Saksbehandler' });
        expect(screen.getByText('Kari Saksbehandler')).toBeInTheDocument();
    });

    test('Viser alder', () => {
        renderBrukerInformasjon({});
        expect(screen.getByText(/42 år/)).toBeInTheDocument();
    });

    test('Viser fødselsnummer label når ikke D-nummer', () => {
        renderBrukerInformasjon({ personIdent: '01020312345' });
        const label = screen.getByText('Fødselsnummer', { selector: 'dt' });
        expect(label).toBeInTheDocument();
        expect(screen.getByText('010203 12345')).toBeInTheDocument();
    });

    test('Viser D-nummer label når D-nummer', () => {
        renderBrukerInformasjon({ personIdent: '40000012345' });
        const label = screen.getByText(/D-nummer$/i, { selector: 'dt' });
        expect(label).toBeInTheDocument();
        expect(screen.getByText('400000 12345')).toBeInTheDocument();
    });

    test('Viser dødsdato-tag når satt', () => {
        renderBrukerInformasjon({ dødsdato: '2024-12-31' });
        expect(screen.getByText('Dødsdato')).toBeInTheDocument();
        expect(screen.getByText('31.12.2024')).toBeInTheDocument();
    });

    test('Skjuler dødsdato når ikke satt', () => {
        renderBrukerInformasjon({ dødsdato: undefined });
        expect(screen.queryByText('Dødsdato')).not.toBeInTheDocument();
    });

    test('Viser institusjon og org.nummer formatert', () => {
        renderBrukerInformasjon({}, { navn: 'Test Institusjon', organisasjonsnummer: '987654321' });
        expect(screen.getByText('Test Institusjon')).toBeInTheDocument();
        expect(screen.getByText('987 654 321')).toBeInTheDocument();
        expect(screen.getByText('Org.nummer')).toBeInTheDocument();
    });

    test('Skjuler institusjon når ikke satt', () => {
        renderBrukerInformasjon({}, null);
        expect(screen.queryByText('Institusjon')).not.toBeInTheDocument();
        expect(screen.queryByText('Org.nummer')).not.toBeInTheDocument();
    });
});
