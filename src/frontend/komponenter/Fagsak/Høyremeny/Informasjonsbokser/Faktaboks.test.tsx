import type { BehandlingDto } from '../../../../generated';
import type { RenderResult } from '@testing-library/react';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { Faktaboks } from './Faktaboks';
import { FagsakContext } from '../../../../context/FagsakContext';
import { ytelsetype, Ytelsetype } from '../../../../kodeverk';
import { TestBehandlingProvider } from '../../../../testdata/behandlingContextFactory';
import { lagBehandling } from '../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';
import {
    Behandlingstatus,
    Behandlingresultat,
    Behandlingårsak,
    behandlingsstatuser,
    behandlingsresultater,
    behandlingårsaker,
} from '../../../../typer/behandling';

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
                name: `Tilbakekreving av ${ytelsetype[Ytelsetype.Barnetrygd].toLocaleLowerCase()}`,
            })
        ).toBeInTheDocument();
    });

    test('Viser revurderingsårsak når satt', () => {
        renderFaktaboks({
            behandlingsårsakstype: Behandlingårsak.RevurderingOpplysningerOmVilkår,
        });
        expect(screen.getByText('Revurderingsårsak')).toBeInTheDocument();
        expect(
            screen.getByText(behandlingårsaker[Behandlingårsak.RevurderingOpplysningerOmVilkår])
        ).toBeInTheDocument();
    });

    test('Skjuler revurderingsårsak når ikke satt', () => {
        renderFaktaboks({ behandlingsårsakstype: undefined });
        expect(screen.queryByText('Revurderingsårsak')).not.toBeInTheDocument();
    });

    test.each<[Behandlingstatus, string]>([
        [Behandlingstatus.Opprettet, 'neutral-moderate'],
        [Behandlingstatus.Utredes, 'info-moderate'],
        [Behandlingstatus.FatterVedtak, 'alt2-moderate'],
        [Behandlingstatus.IverksetterVedtak, 'info-moderate'],
        [Behandlingstatus.Avsluttet, 'success-moderate'],
    ])('Status tag variant %s', (status, forventetVariant) => {
        renderFaktaboks({ status });
        const tags = screen.getAllByText(behandlingsstatuser[status]);
        const tag = tags.find(el => el.classList.contains('navds-tag'));
        expect(tag).toBeTruthy();
        expect(tag?.className).toContain(forventetVariant);
    });

    test.each<[Behandlingresultat, string]>([
        [Behandlingresultat.Henlagt, 'error-moderate'],
        [Behandlingresultat.IngenTilbakebetaling, 'warning-moderate'],
        [Behandlingresultat.DelvisTilbakebetaling, 'warning-moderate'],
        [Behandlingresultat.FullTilbakebetaling, 'info-moderate'],
    ])('Resultat tag variant %s', (resultat, forventetVariant) => {
        renderFaktaboks({ resultatstype: resultat });
        const tag = screen.getByText(behandlingsresultater[resultat]);
        expect(tag.className).toContain(forventetVariant);
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
