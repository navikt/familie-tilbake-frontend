import type { Hendelse } from '@/generated-new';

import { render, screen, within } from '@testing-library/react';

import { Hendelser } from './Hendelser';

const lagHendelse = (overstyring: Partial<Hendelse> = {}): Hendelse => ({
    tittel: 'Behandling opprettet',
    opprettet: '2026-11-10T09:30:00',
    rolle: 'VEDTAKSLØSNING',
    rolleIdent: null,
    beskrivelse: null,
    ekstraInfo: {},
    ...overstyring,
});

describe('Hendelser', () => {
    test('skal vise hendelsene som steg i prosessen med nyeste først', () => {
        render(
            <Hendelser
                hendelser={[
                    lagHendelse({
                        tittel: 'Behandling opprettet',
                        opprettet: '2026-11-10T09:30:00',
                    }),
                    lagHendelse({ tittel: 'Vedtak fattet', opprettet: '2026-11-12T14:15:00' }),
                    lagHendelse({ tittel: 'Varsel sendt', opprettet: '2026-11-11T10:00:00' }),
                ]}
            />
        );

        const steg = within(screen.getByRole('list', { name: 'Historikk' })).getAllByRole(
            'listitem'
        );
        expect(steg).toHaveLength(3);
        expect(steg[0]).toHaveTextContent('Vedtak fattet');
        expect(steg[1]).toHaveTextContent('Varsel sendt');
        expect(steg[2]).toHaveTextContent('Behandling opprettet');
    });

    test('skal vise tidspunkt, rolle, beskrivelse og ekstra informasjon', () => {
        render(
            <Hendelser
                hendelser={[
                    lagHendelse({
                        tittel: 'Sendt til beslutter',
                        opprettet: '2026-11-12T14:15:00',
                        rolle: 'SAKSBEHANDLER',
                        rolleIdent: 'Z999999',
                        beskrivelse: 'Første linje\nAndre linje',
                        ekstraInfo: { Begrunnelse: 'Klar for godkjenning' },
                    }),
                ]}
            />
        );

        expect(screen.getByText('12.11.2026 kl. 14:15')).toBeInTheDocument();
        expect(screen.getByText('Saksbehandler')).toBeInTheDocument();
        expect(screen.getByText('Z999999')).toBeInTheDocument();
        expect(screen.getByText(/Første linje\s+Andre linje/)).toBeInTheDocument();
        expect(screen.getByText('Begrunnelse: Klar for godkjenning')).toBeInTheDocument();
    });

    test('skal vise knapp for dokument i stedet for journalpost- og dokument-id', () => {
        render(
            <Hendelser
                hendelser={[
                    lagHendelse({
                        tittel: 'Varsel sendt',
                        ekstraInfo: {
                            JOURNALPOST_ID: '123',
                            DOKUMENTINFO_ID: '456',
                            Mottaker: 'Bruker',
                        },
                    }),
                ]}
            />
        );

        expect(
            screen.getByRole('button', { name: 'Åpne dokument: Varsel sendt' })
        ).toBeInTheDocument();
        expect(screen.getByText('Mottaker: Bruker')).toBeInTheDocument();
        expect(screen.queryByText(/JOURNALPOST_ID|DOKUMENTINFO_ID/)).not.toBeInTheDocument();
    });

    test('skal ikke vise dokumentknapp når dokument-id mangler', () => {
        render(<Hendelser hendelser={[lagHendelse({ ekstraInfo: { JOURNALPOST_ID: '123' } })]} />);

        expect(screen.queryByRole('button', { name: /Åpne dokument/ })).not.toBeInTheDocument();
    });

    test('skal vise melding når det ikke finnes hendelser', () => {
        render(<Hendelser hendelser={[]} />);

        expect(screen.getByText('Det finnes ingen historikk')).toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
});
