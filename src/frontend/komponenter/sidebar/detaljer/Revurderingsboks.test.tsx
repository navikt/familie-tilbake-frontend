import { render, screen } from '@testing-library/react';

import { hentRevurderingsårsak } from '@/typer/revurdering';

import { Revurderingsboks } from './Revurderingsboks';

describe('Revurderingsboks', () => {
    test('Viser behandlingsårsak for gammel modell', () => {
        render(
            <Revurderingsboks
                behandlingsårsakstype="REVURDERING_OPPLYSNINGER_OM_VILKÅR"
                revurdering={null}
            />
        );

        expect(screen.getByText('Nye opplysninger om vilkårsvurdering')).toBeInTheDocument();
        expect(screen.queryByText('Instans')).not.toBeInTheDocument();
        expect(screen.queryByText('Begrunnelse for revurdering')).not.toBeInTheDocument();
    });

    test('Viser gammel årsak når revurderingsobjektet er null', () => {
        render(
            <Revurderingsboks
                behandlingsårsakstype="REVURDERING_OPPLYSNINGER_OM_VILKÅR"
                revurdering={null}
            />
        );

        expect(screen.getByText('Nye opplysninger om vilkårsvurdering')).toBeInTheDocument();
    });

    test('Skjuler boksen når ingen data er sendt inn', () => {
        render(<Revurderingsboks behandlingsårsakstype={undefined} revurdering={null} />);

        expect(
            screen.queryByRole('region', { name: 'Revurderingsinformasjon' })
        ).not.toBeInTheDocument();
    });

    test('Viser årsak, instans og begrunnelse ved revurdering etter klage', () => {
        render(
            <Revurderingsboks
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

        expect(screen.getByText(hentRevurderingsårsak.etter_klage)).toBeInTheDocument();
        expect(screen.getByText('Instans')).toBeInTheDocument();
        expect(screen.getByText('Klageinstansen')).toBeInTheDocument();
        expect(screen.getByText('Begrunnelse for revurdering')).toBeInTheDocument();
        expect(screen.getByText('Vedtaket er omgjort etter klage')).toBeInTheDocument();
    });

    test('Viser årsak, instans og begrunnelse når feilutbetalt beløp er endret', () => {
        render(
            <Revurderingsboks
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
            screen.getByText(hentRevurderingsårsak.feilutbetalt_belop_endret)
        ).toBeInTheDocument();
        expect(screen.getByText('Instans')).toBeInTheDocument();
        expect(screen.getByText('Førsteinstansen')).toBeInTheDocument();
        expect(screen.getByText('Begrunnelse for revurdering')).toBeInTheDocument();
        expect(screen.getByText('Feilutbetalt beløp er redusert')).toBeInTheDocument();
    });

    test('Viser årsak og begrunnelse uten instans ved foreldelse', () => {
        render(
            <Revurderingsboks
                behandlingsårsakstype={undefined}
                revurdering={{
                    revurderingsarsak: {
                        revurderingsarsak: 'ForeldelseDto',
                        begrunnelse: 'Kravet er foreldet',
                    },
                }}
            />
        );

        expect(screen.getByText(hentRevurderingsårsak.foreldelse)).toBeInTheDocument();
        expect(screen.queryByText('Instans')).not.toBeInTheDocument();
        expect(screen.getByText('Begrunnelse for revurdering')).toBeInTheDocument();
        expect(screen.getByText('Kravet er foreldet')).toBeInTheDocument();
    });

    test('Viser årsak, instans og begrunnelse ved revurdering uten klage', () => {
        render(
            <Revurderingsboks
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

        expect(screen.getByText(hentRevurderingsårsak.uten_klage)).toBeInTheDocument();
        expect(screen.getByText('Instans')).toBeInTheDocument();
        expect(screen.getByText('Førsteinstansen')).toBeInTheDocument();
        expect(screen.getByText('Begrunnelse for revurdering')).toBeInTheDocument();
        expect(screen.getByText('Vedtaket er omgjort uten klage')).toBeInTheDocument();
    });
});
