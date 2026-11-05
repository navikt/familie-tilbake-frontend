import type { ReactElement } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagBehandling } from '@/testdata/behandlingFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';
import { hentRevurderingsårsak } from '@/typer/revurdering';

import { Revurderingsboks } from './Revurderingsboks';

const renderBoks = (boks: ReactElement): void => {
    render(
        <QueryClientProvider client={createTestQueryClient()}>
            <TestBehandlingProvider behandling={lagBehandling({ erNyModell: true })}>
                {boks}
            </TestBehandlingProvider>
        </QueryClientProvider>
    );
};

describe('Revurderingsboks', () => {
    test('Viser behandlingsårsak for gammel modell', () => {
        renderBoks(
            <Revurderingsboks
                kanEndres
                behandlingsårsakstype="REVURDERING_OPPLYSNINGER_OM_VILKÅR"
                revurdering={null}
            />
        );

        expect(screen.getByText('Nye opplysninger om vilkårsvurdering')).toBeInTheDocument();
        expect(screen.queryByText('Instans')).not.toBeInTheDocument();
        expect(screen.queryByText('Begrunnelse for revurdering')).not.toBeInTheDocument();
    });

    test('Viser gammel årsak når revurderingsobjektet er null', () => {
        renderBoks(
            <Revurderingsboks
                kanEndres
                behandlingsårsakstype="REVURDERING_OPPLYSNINGER_OM_VILKÅR"
                revurdering={null}
            />
        );

        expect(screen.getByText('Nye opplysninger om vilkårsvurdering')).toBeInTheDocument();
    });

    test('Skjuler boksen når ingen data er sendt inn', () => {
        renderBoks(
            <Revurderingsboks kanEndres behandlingsårsakstype={undefined} revurdering={null} />
        );

        expect(
            screen.queryByRole('region', { name: 'Revurderingsinformasjon' })
        ).not.toBeInTheDocument();
    });

    test('Viser årsak, instans og begrunnelse ved revurdering etter klage', () => {
        renderBoks(
            <Revurderingsboks
                kanEndres
                behandlingsårsakstype={undefined}
                revurdering={{
                    revurderingsarsak: {
                        revurderingsarsak: 'EtterKlageDto',
                        instans: 'Klageinstansen',
                        begrunnelse: 'Vedtaket er omgjort etter klage',
                    },
                }}
            />
        );

        expect(
            screen.getByText(hentRevurderingsårsak.etter_klage, { selector: 'dd' })
        ).toBeInTheDocument();
        expect(screen.getByText('Instans')).toBeInTheDocument();
        expect(screen.getByText('Klageinstansen', { selector: 'dd' })).toBeInTheDocument();
        expect(screen.getByText('Begrunnelse for revurdering')).toBeInTheDocument();
        expect(screen.getByText('Vedtaket er omgjort etter klage')).toBeInTheDocument();
    });

    test('Viser årsak, instans og begrunnelse når feilutbetalt beløp er endret', () => {
        renderBoks(
            <Revurderingsboks
                kanEndres
                behandlingsårsakstype={undefined}
                revurdering={{
                    revurderingsarsak: {
                        revurderingsarsak: 'FeilutbetaltBelopEndretDto',
                        instans: 'Førsteinstansen',
                        begrunnelse: 'Feilutbetalt beløp er redusert',
                    },
                }}
            />
        );

        expect(
            screen.getByText(hentRevurderingsårsak.feilutbetalt_belop_endret, { selector: 'dd' })
        ).toBeInTheDocument();
        expect(screen.getByText('Instans')).toBeInTheDocument();
        expect(screen.getByText('Førsteinstansen', { selector: 'dd' })).toBeInTheDocument();
        expect(screen.getByText('Begrunnelse for revurdering')).toBeInTheDocument();
        expect(screen.getByText('Feilutbetalt beløp er redusert')).toBeInTheDocument();
    });

    test('Viser årsak og begrunnelse uten instans ved foreldelse', () => {
        renderBoks(
            <Revurderingsboks
                kanEndres
                behandlingsårsakstype={undefined}
                revurdering={{
                    revurderingsarsak: {
                        revurderingsarsak: 'ForeldelseDto',
                        begrunnelse: 'Kravet er foreldet',
                    },
                }}
            />
        );

        expect(
            screen.getByText(hentRevurderingsårsak.foreldelse, { selector: 'dd' })
        ).toBeInTheDocument();
        expect(screen.queryByText('Instans')).not.toBeInTheDocument();
        expect(screen.getByText('Begrunnelse for revurdering')).toBeInTheDocument();
        expect(screen.getByText('Kravet er foreldet')).toBeInTheDocument();
    });

    test('Viser årsak, instans og begrunnelse ved revurdering uten klage', () => {
        renderBoks(
            <Revurderingsboks
                kanEndres
                behandlingsårsakstype={undefined}
                revurdering={{
                    revurderingsarsak: {
                        revurderingsarsak: 'UtenKlageDto',
                        instans: 'Førsteinstansen',
                        begrunnelse: 'Vedtaket er omgjort uten klage',
                    },
                }}
            />
        );

        expect(
            screen.getByText(hentRevurderingsårsak.uten_klage, { selector: 'dd' })
        ).toBeInTheDocument();
        expect(screen.getByText('Instans')).toBeInTheDocument();
        expect(screen.getByText('Førsteinstansen', { selector: 'dd' })).toBeInTheDocument();
        expect(screen.getByText('Begrunnelse for revurdering')).toBeInTheDocument();
        expect(screen.getByText('Vedtaket er omgjort uten klage')).toBeInTheDocument();
    });

    test('Skjuler redigeringsknappen når behandlingen ikke kan endres', () => {
        renderBoks(
            <Revurderingsboks
                kanEndres={false}
                behandlingsårsakstype={undefined}
                revurdering={{
                    revurderingsarsak: {
                        revurderingsarsak: 'ForeldelseDto',
                        begrunnelse: 'Kravet er foreldet',
                    },
                }}
            />
        );

        expect(
            screen.queryByRole('button', { name: 'Rediger revurdering' })
        ).not.toBeInTheDocument();
    });
});
