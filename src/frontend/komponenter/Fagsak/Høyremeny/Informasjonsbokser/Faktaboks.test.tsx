import type { Behandling } from '../../../../typer/behandling';
import type { RenderResult } from '@testing-library/react';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { Faktaboks } from './Faktaboks';
import { ytelsetype, Ytelsetype } from '../../../../kodeverk';
import { lagFagsak } from '../../../../testdata/fagsakFactory';
import {
    Behandlingstatus,
    Behandlingresultat,
    Behandlingårsak,
    behandlingsstatuser,
    behandlingsresultater,
    behandlingårsaker,
    Saksbehandlingstype,
    Behandlingstype,
} from '../../../../typer/behandling';

const baseBehandling = (override: Partial<Behandling> = {}): Behandling => ({
    eksternBrukId: 'ebb',
    behandlingId: 'bid',
    erBehandlingHenlagt: false,
    type: Behandlingstype.Tilbakekreving,
    status: Behandlingstatus.Opprettet,
    opprettetDato: '2025-01-02',
    avsluttetDato: null,
    endretTidspunkt: '2025-01-02T10:00:00',
    vedtaksDato: null,
    enhetskode: '4800',
    enhetsnavn: 'NAV Familie',
    resultatstype: null,
    ansvarligSaksbehandler: 'Z12345',
    ansvarligBeslutter: null,
    erBehandlingPåVent: false,
    kanHenleggeBehandling: true,
    kanRevurderingOpprettes: true,
    harVerge: false,
    kanEndres: true,
    kanSetteTilbakeTilFakta: true,
    varselSendt: false,
    behandlingsstegsinfo: [],
    fagsystemsbehandlingId: 'fsb',
    eksternFaksakId: 'ekstern',
    behandlingsårsakstype: null,
    støtterManuelleBrevmottakere: false,
    harManuelleBrevmottakere: false,
    manuelleBrevmottakere: [],
    begrunnelseForTilbakekreving: null,
    saksbehandlingstype: Saksbehandlingstype.Ordinær,
    erNyModell: true,
    ...override,
});
const mockUseFagsak = jest.fn();
jest.mock('../../../../context/FagsakContext', () => ({
    useFagsak: (): { fagsak: { ytelsestype: Ytelsetype } } => mockUseFagsak(),
}));

const renderFaktaboks = (delvisBehandling: Partial<Behandling> = {}): RenderResult =>
    render(<Faktaboks behandling={baseBehandling(delvisBehandling)} />);

describe('Faktaboks', () => {
    test('Viser heading med ytelsestype', () => {
        mockUseFagsak.mockReturnValue({
            fagsak: lagFagsak({ ytelsestype: Ytelsetype.Barnetrygd }),
        });
        renderFaktaboks();
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
        renderFaktaboks({ behandlingsårsakstype: null });
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

    test('Skjuler avsluttet når null', () => {
        renderFaktaboks({ avsluttetDato: null });
        expect(screen.queryByText('Avsluttet')).not.toBeInTheDocument();
    });

    test('Viser enhet', () => {
        renderFaktaboks({ enhetskode: '1234', enhetsnavn: 'NAV Test' });
        expect(screen.getByText(/1234 NAV Test/)).toBeInTheDocument();
    });
});
