import type { VedtaksbrevFormData } from './schema';
import type { Avsnitt, VedtaksbrevData } from '~/generated-new';

import { describe, expect, test } from 'vitest';

import { vedtaksbrevResolver } from './schema';
import { elementArrayTilTekst, tekstTilElementArray, tilVedtaksbrevDataWritable } from './utils';

const lagVedtaksbrevData = (overrides: Partial<VedtaksbrevData> = {}): VedtaksbrevData => ({
    hovedavsnitt: {
        tittel: 'Du må ikke betale tilbake barnetrygden',
        forklaring:
            'Her viser du til vedtaksbrevet om revurdering, det feilutbetalte beløpet og hva brukeren skal betale tilbake.',
        underavsnitt: [{ type: 'rentekst', tekst: 'Opprinnelig hovedtekst' }],
    },
    avsnitt: [],
    sistOppdatert: '2026-04-16T12:00:00Z',
    brevGjelder: { navn: 'Ola Nordmann', personIdent: '12345678901' },
    sendtDato: '2026-04-16',
    ytelse: { url: '/barnetrygd', ubestemtEntall: 'barnetrygd', bestemtEntall: 'barnetrygden' },
    signatur: {
        enhetNavn: 'NAV Klageinstans',
        ansvarligSaksbehandler: 'Saksbehandler A',
        besluttendeSaksbehandler: null,
    },
    oppsummeringstabell: [],
    bunntekster: [],
    saksnummer: '0012345678',
    ...overrides,
});

const lagFormData = (overrides: Partial<VedtaksbrevFormData> = {}): VedtaksbrevFormData => ({
    hovedavsnitt: {
        tittel: 'Du må ikke betale tilbake barnetrygden',
        underavsnitt: [{ type: 'rentekst', tekst: 'Redigert hovedtekst' }],
    },
    avsnitt: [],
    ...overrides,
});

describe('tilVedtaksbrevDataWritable', () => {
    test('kopierer statiske felter og utelater sistOppdatert', () => {
        const vedtaksbrevData = lagVedtaksbrevData();

        const resultat = tilVedtaksbrevDataWritable(vedtaksbrevData, lagFormData());

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { sistOppdatert, hovedavsnitt, avsnitt, ...statiskeFelter } = vedtaksbrevData;
        expect(resultat).toMatchObject(statiskeFelter);
        expect(resultat).not.toHaveProperty('sistOppdatert');
    });

    test('mapper avsnitt med redigerte underavsnitt og skriver på påkrevd_begrunnelse', () => {
        const opprinneligAvsnitt = [
            {
                tittel: 'Dette er grunnen til at du har fått for mye utbetalt',
                forklaring: 'Skal ikke med',
                meldingerTilSaksbehandler: [],
                id: 'avsnitt-1',
                underavsnitt: [
                    { type: 'rentekst', tekst: 'Opprinnelig tekst' },
                    {
                        type: 'påkrevd_begrunnelse',
                        tittel: 'Særlige grunner',
                        forklaring: 'Forklar dette',
                        meldingerTilSaksbehandler: [],
                        begrunnelseType: 'særlige_grunner',
                        underavsnitt: [{ type: 'rentekst', tekst: 'Opprinnelig begrunnelse' }],
                    },
                ],
            } satisfies Avsnitt,
        ];

        const formAvsnitt: VedtaksbrevFormData['avsnitt'] = [
            {
                tittel: 'Dette er grunnen til at du har fått for mye utbetalt',
                id: 'avsnitt-1',
                underavsnitt: [
                    { type: 'rentekst', tekst: 'Redigert tekst' },
                    {
                        type: 'påkrevd_begrunnelse',
                        begrunnelseType: 'særlige_grunner',
                        underavsnitt: [{ type: 'rentekst', tekst: 'Redigert begrunnelse' }],
                    },
                ],
            },
        ];

        const vedtaksbrevData = lagVedtaksbrevData({ avsnitt: opprinneligAvsnitt });
        const formData = lagFormData({ avsnitt: formAvsnitt });

        const resultat = tilVedtaksbrevDataWritable(vedtaksbrevData, formData);

        expect(resultat.avsnitt).toHaveLength(1);
        expect(resultat.avsnitt[0]).toEqual({
            tittel: 'Dette er grunnen til at du har fått for mye utbetalt',
            id: 'avsnitt-1',
            underavsnitt: [
                { type: 'rentekst', tekst: 'Redigert tekst' },
                {
                    type: 'påkrevd_begrunnelse',
                    tittel: 'Særlige grunner',
                    begrunnelseType: 'særlige_grunner',
                    underavsnitt: [{ type: 'rentekst', tekst: 'Redigert begrunnelse' }],
                },
            ],
        });
    });
});

describe('elementArrayTilTekst', () => {
    test('konverterer ett element til tekst', () => {
        const input = [{ type: 'rentekst' as const, tekst: 'Dette er en tekst' }];
        const result = elementArrayTilTekst(input);

        expect(result).toBe('Dette er en tekst');
    });

    test('konverterer flere elementer til tekst med dobbelt linjeskift', () => {
        const input = [
            { type: 'rentekst' as const, tekst: 'Første avsnitt' },
            { type: 'rentekst' as const, tekst: 'Andre avsnitt' },
            { type: 'rentekst' as const, tekst: 'Tredje avsnitt' },
        ];
        const result = elementArrayTilTekst(input);

        expect(result).toBe('Første avsnitt\n\nAndre avsnitt\n\nTredje avsnitt');
    });
});

describe('tekstTilElementArray', () => {
    test('konverterer en enkel tekst til element', () => {
        const result = tekstTilElementArray('Dette er en tekst');

        expect(result).toEqual([{ type: 'rentekst', tekst: 'Dette er en tekst' }]);
    });

    test('konverterer tekst med dobbelt linjeskift til flere elementer', () => {
        const result = tekstTilElementArray('Første avsnitt\n\nAndre avsnitt\n\nTredje avsnitt');

        expect(result).toEqual([
            { type: 'rentekst', tekst: 'Første avsnitt' },
            { type: 'rentekst', tekst: 'Andre avsnitt' },
            { type: 'rentekst', tekst: 'Tredje avsnitt' },
        ]);
    });

    test('håndterer flere påfølgende linjeskift som ett skille', () => {
        const result = tekstTilElementArray('Første\n\n\n\nAndre\n\n\n\n\nTredje');

        expect(result).toEqual([
            { type: 'rentekst', tekst: 'Første' },
            { type: 'rentekst', tekst: 'Andre' },
            { type: 'rentekst', tekst: 'Tredje' },
        ]);
    });

    test('bevarer enkelt linjeskift innenfor samme element', () => {
        const result = tekstTilElementArray('Første linje\nAndre linje\n\nNytt avsnitt');

        expect(result).toEqual([
            { type: 'rentekst', tekst: 'Første linje\nAndre linje' },
            { type: 'rentekst', tekst: 'Nytt avsnitt' },
        ]);
    });
});

describe('vedtaksbrevResolver', () => {
    const kjørResolver = async (
        data: VedtaksbrevFormData
    ): Promise<ReturnType<typeof vedtaksbrevResolver>> =>
        vedtaksbrevResolver(
            data,
            {},
            {
                names: [],
                fields: {},
                shouldUseNativeValidation: false,
            }
        );

    const FORVENTET_FEILMELDING = 'Du må fylle inn minst 3 tegn';

    const lagAvsnitt = (
        underavsnitt: VedtaksbrevFormData['avsnitt'][number]['underavsnitt']
    ): VedtaksbrevFormData['avsnitt'][number] => ({
        tittel: 'Avsnittstittel',
        id: '550e8400-e29b-41d4-a716-446655440000',
        underavsnitt,
    });

    test('passerer for gyldig data', async () => {
        const { errors } = await kjørResolver({
            hovedavsnitt: {
                tittel: 'Hovedtittel',
                underavsnitt: [{ type: 'rentekst', tekst: 'noe tekst' }],
            },
            avsnitt: [
                lagAvsnitt([
                    { type: 'rentekst', tekst: 'periodetekst' },
                    {
                        type: 'påkrevd_begrunnelse',
                        begrunnelseType: 'test',
                        underavsnitt: [{ type: 'rentekst', tekst: 'begrunnelse' }],
                    },
                ]),
            ],
        });

        expect(errors).toEqual({});
    });

    test('gir feil når hovedavsnitt har under 3 tegn rentekst', async () => {
        const { errors } = await kjørResolver({
            hovedavsnitt: {
                tittel: 'Hovedtittel',
                underavsnitt: [{ type: 'rentekst', tekst: 'ab' }],
            },
            avsnitt: [],
        });

        expect(errors).toHaveProperty(
            ['hovedavsnitt', 'underavsnitt', 'message'],
            FORVENTET_FEILMELDING
        );
    });

    test('gir feil når avsnitt mangler rentekst-elementer', async () => {
        const { errors } = await kjørResolver({
            hovedavsnitt: {
                tittel: 'Hovedtittel',
                underavsnitt: [{ type: 'rentekst', tekst: 'noe tekst' }],
            },
            avsnitt: [
                lagAvsnitt([
                    {
                        type: 'påkrevd_begrunnelse',
                        begrunnelseType: 'test',
                        underavsnitt: [{ type: 'rentekst', tekst: 'begrunnelse' }],
                    },
                ]),
            ],
        });

        expect(errors).toHaveProperty(
            ['avsnitt', 0, 'underavsnitt', 'message'],
            FORVENTET_FEILMELDING
        );
    });

    test('gir feil når påkrevd_begrunnelse har for lite rentekst', async () => {
        const { errors } = await kjørResolver({
            hovedavsnitt: {
                tittel: 'Hovedtittel',
                underavsnitt: [{ type: 'rentekst', tekst: 'noe tekst' }],
            },
            avsnitt: [
                lagAvsnitt([
                    { type: 'rentekst', tekst: 'noe tekst' },
                    {
                        type: 'påkrevd_begrunnelse',
                        begrunnelseType: 'test',
                        underavsnitt: [],
                    },
                ]),
            ],
        });

        expect(errors).toHaveProperty(
            ['avsnitt', 0, 'underavsnitt', 1, 'underavsnitt', 'message'],
            FORVENTET_FEILMELDING
        );
    });
});
