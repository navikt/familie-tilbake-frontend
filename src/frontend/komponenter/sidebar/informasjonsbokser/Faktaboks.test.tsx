import type {
    BehandlingDto,
    BehandlingsresultatstypeEnum,
    BehandlingstatusEnum,
} from '../../../generated';
import type { RenderResult } from '@testing-library/react';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { Faktaboks } from './Faktaboks';
import { FagsakContext } from '../../../context/FagsakContext';
import { Ytelsetype } from '../../../kodeverk';
import { TestBehandlingProvider } from '../../../testdata/behandlingContextFactory';
import { lagBehandling } from '../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import {
    behandlingsstatuser,
    behandlingsresultater,
    behandlingsårsaker,
} from '../../../typer/behandling';

const renderFaktaboks = (
    delvisBehandling: Partial<BehandlingDto> = {},
    ytelsestypeOverride: Ytelsetype = Ytelsetype.Barnetrygd
): RenderResult => {
    const behandling = lagBehandling(delvisBehandling);
    return render(
        <FagsakContext.Provider value={lagFagsak({ ytelsestype: ytelsestypeOverride })}>
            <TestBehandlingProvider behandling={behandling}>
                <Faktaboks />
            </TestBehandlingProvider>
        </FagsakContext.Provider>
    );
};

describe('Faktaboks', () => {
    test('Viser heading med ytelsestype', () => {
        renderFaktaboks({}, Ytelsetype.Barnetrygd);
        expect(
            screen.getByRole('heading', {
                name: `Tilbakekreving av ${Ytelsetype.Barnetrygd.toLocaleLowerCase()}`,
            })
        ).toBeInTheDocument();
    });

    test('Viser revurderingsårsak når satt', () => {
        renderFaktaboks({
            behandlingsårsakstype: 'REVURDERING_OPPLYSNINGER_OM_VILKÅR',
        });
        expect(screen.getByText('Revurderingsårsak')).toBeInTheDocument();
        expect(
            screen.getByText(behandlingsårsaker['REVURDERING_OPPLYSNINGER_OM_VILKÅR'])
        ).toBeInTheDocument();
    });

    test('Skjuler revurderingsårsak når ikke satt', () => {
        renderFaktaboks({ behandlingsårsakstype: undefined });
        expect(screen.queryByText('Revurderingsårsak')).not.toBeInTheDocument();
    });

    test.each<[BehandlingstatusEnum, string]>([
        ['OPPRETTET', 'neutral'],
        ['UTREDES', 'info'],
        ['FATTER_VEDTAK', 'meta-purple'],
        ['IVERKSETTER_VEDTAK', 'meta-lime'],
        ['AVSLUTTET', 'success'],
    ])('Status tag variant %s', (status, forventetDataColor) => {
        renderFaktaboks({ status });
        const tags = screen.getAllByText(behandlingsstatuser[status]);
        const tag = tags.find(el => el.classList.contains('aksel-tag'));
        expect(tag).toBeTruthy();
        expect(tag?.getAttribute('data-color')).toBe(forventetDataColor);
    });

    test.each<[BehandlingsresultatstypeEnum, string]>([
        ['HENLAGT', 'danger'],
        ['INGEN_TILBAKEBETALING', 'warning'],
        ['DELVIS_TILBAKEBETALING', 'warning'],
        ['FULL_TILBAKEBETALING', 'info'],
    ])('Resultat tag variant %s', (resultat, forventetDataColor) => {
        renderFaktaboks({ resultatstype: resultat });
        const tags = screen.getAllByText(behandlingsresultater[resultat]);
        const tag = tags.find(el => el.classList.contains('aksel-tag'));
        expect(tag).toBeTruthy();
        expect(tag?.getAttribute('data-color')).toBe(forventetDataColor);
    });

    test('Viser opprettet dato formatert', () => {
        renderFaktaboks({ opprettetDato: '2025-01-02' });
        expect(screen.getByText('02.01.2025')).toBeInTheDocument();
    });

    test('Viser avsluttet når satt', () => {
        renderFaktaboks({ avsluttetDato: '2025-02-03' });
        expect(screen.getByText('Avsluttet')).toBeInTheDocument();
        expect(screen.getByText('03.02.2025')).toBeInTheDocument();
    });

    test('Skjuler avsluttet når undefined', () => {
        renderFaktaboks({ avsluttetDato: undefined });
        expect(screen.queryByText('Avsluttet')).not.toBeInTheDocument();
    });

    test('Viser enhet', () => {
        renderFaktaboks({ enhetskode: '1234', enhetsnavn: 'NAV Test' });
        expect(screen.getByText(/1234 NAV Test/)).toBeInTheDocument();
    });
});
