import type { TagProps } from '@navikt/ds-react';
import type {
    BehandlingDto,
    BehandlingsresultatstypeEnum,
    BehandlingstatusEnum,
    SchemaEnum4,
} from '@/generated';

import { render, screen } from '@testing-library/react';

import { FagsakContext } from '@/context/FagsakContext';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagBehandling } from '@/testdata/behandlingFactory';
import { lagFagsak } from '@/testdata/fagsakFactory';
import { behandlingsresultater, behandlingsstatuser } from '@/typer/behandling';

import { Faktaboks } from './Faktaboks';

const renderFaktaboks = (
    delvisBehandling: Partial<BehandlingDto> = {},
    ytelsestypeOverride: SchemaEnum4 = 'BARNETRYGD'
): void => {
    const behandling = lagBehandling(delvisBehandling);
    render(
        <FagsakContext value={lagFagsak({ ytelsestype: ytelsestypeOverride })}>
            <TestBehandlingProvider behandling={behandling}>
                <Faktaboks />
            </TestBehandlingProvider>
        </FagsakContext>
    );
};

describe('Faktaboks', () => {
    test('Viser heading med ytelsestype', () => {
        renderFaktaboks({}, 'BARNETRYGD');
        expect(
            screen.getByRole('heading', {
                name: 'Tilbakekreving av barnetrygd',
                level: 2,
            })
        ).toBeInTheDocument();
    });

    test.each<[BehandlingstatusEnum, TagProps['data-color']]>([
        ['OPPRETTET', 'neutral'],
        ['UTREDES', 'info'],
        ['FATTER_VEDTAK', 'brand-beige'],
        ['IVERKSETTER_VEDTAK', 'meta-lime'],
        ['JOURNALFØR_VEDTAK', 'neutral'],
        ['DISTRIUBER_VEDTAK', 'neutral'],
        ['AVSLUTTET', 'success'],
    ])('Status tag variant %s', (status, forventetDataColor) => {
        renderFaktaboks({ status });
        expect(screen.getByText(behandlingsstatuser[status], { selector: 'span' })).toHaveAttribute(
            'data-color',
            forventetDataColor
        );
    });

    test.each<[BehandlingsresultatstypeEnum, TagProps['data-color']]>([
        ['HENLAGT', 'danger'],
        ['INGEN_TILBAKEBETALING', 'success'],
        ['DELVIS_TILBAKEBETALING', 'meta-purple'],
        ['FULL_TILBAKEBETALING', 'brand-magenta'],
    ])('Resultat tag variant %s', (resultat, forventetDataColor) => {
        renderFaktaboks({ resultatstype: resultat });
        expect(screen.getByText(behandlingsresultater[resultat])).toHaveAttribute(
            'data-color',
            forventetDataColor
        );
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
