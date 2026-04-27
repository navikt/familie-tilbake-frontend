import type { VedtaksbrevFormData } from './schema';
import type { Avsnitt, VedtaksbrevData } from '~/generated-new';

import { describe, expect, test } from 'vitest';

import { vedtaksbrevResolver } from './schema';
import {
    elementArrayTilTekst,
    tekstTilElementArray,
    tilFormData,
    tilVedtaksbrevDataWritable,
} from './utils';

const lagVedtaksbrevData = (overrides: Partial<VedtaksbrevData> = {}): VedtaksbrevData => ({
    hovedavsnitt: {
        tittel: 'Du må ikke betale tilbake barnetrygden',
        forklaring: 'Forklaring',
        underavsnitt: [{ type: 'rentekst', tekst: 'Opprinnelig hovedtekst' }],
        hjemler: '§ 22-15',
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
    hovedavsnitt: { tekst: 'Redigert hovedtekst' },
    avsnitt: [],
    ...overrides,
});

const lagOpprinneligAvsnittMedBegrunnelse = (): Avsnitt => ({
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
});

describe('tilFormData', () => {
    test('flater ut hovedavsnitt og avsnitt med påkrevde begrunnelser', () => {
        const vedtaksbrevData = lagVedtaksbrevData({
            avsnitt: [lagOpprinneligAvsnittMedBegrunnelse()],
        });

        const result = tilFormData(vedtaksbrevData);

        expect(result).toEqual({
            hovedavsnitt: { tekst: 'Opprinnelig hovedtekst' },
            avsnitt: [
                {
                    id: 'avsnitt-1',
                    tekst: 'Opprinnelig tekst',
                    påkrevdeBegrunnelser: [
                        {
                            begrunnelseType: 'særlige_grunner',
                            tekst: 'Opprinnelig begrunnelse',
                        },
                    ],
                },
            ],
        });
    });
});

describe('tilVedtaksbrevDataWritable', () => {
    test('kopierer statiske felter og utelater sistOppdatert', () => {
        const vedtaksbrevData = lagVedtaksbrevData();

        const resultat = tilVedtaksbrevDataWritable(vedtaksbrevData, lagFormData());

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { sistOppdatert, hovedavsnitt, avsnitt, ...statiskeFelter } = vedtaksbrevData;
        expect(resultat).toMatchObject(statiskeFelter);
        expect(resultat.hovedavsnitt.hjemler).toEqual(vedtaksbrevData.hovedavsnitt.hjemler);
        expect(resultat).not.toHaveProperty('sistOppdatert');
    });

    test('mapper avsnitt med redigerte underavsnitt og bevarer tittel på påkrevd_begrunnelse', () => {
        const vedtaksbrevData = lagVedtaksbrevData({
            avsnitt: [lagOpprinneligAvsnittMedBegrunnelse()],
        });

        const formData = lagFormData({
            avsnitt: [
                {
                    id: 'avsnitt-1',
                    tekst: 'Redigert tekst',
                    påkrevdeBegrunnelser: [
                        { begrunnelseType: 'særlige_grunner', tekst: 'Redigert begrunnelse' },
                    ],
                },
            ],
        });

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
        expect(elementArrayTilTekst([{ type: 'rentekst', tekst: 'Dette er en tekst' }])).toBe(
            'Dette er en tekst'
        );
    });

    test('konverterer flere elementer til tekst med dobbelt linjeskift', () => {
        const result = elementArrayTilTekst([
            { type: 'rentekst', tekst: 'Første avsnitt' },
            { type: 'rentekst', tekst: 'Andre avsnitt' },
            { type: 'rentekst', tekst: 'Tredje avsnitt' },
        ]);

        expect(result).toBe('Første avsnitt\n\nAndre avsnitt\n\nTredje avsnitt');
    });
});

describe('tekstTilElementArray', () => {
    test('konverterer en enkel tekst til element', () => {
        expect(tekstTilElementArray('Dette er en tekst')).toEqual([
            { type: 'rentekst', tekst: 'Dette er en tekst' },
        ]);
    });

    test('konverterer tekst med dobbelt linjeskift til flere elementer', () => {
        expect(tekstTilElementArray('Første avsnitt\n\nAndre avsnitt\n\nTredje avsnitt')).toEqual([
            { type: 'rentekst', tekst: 'Første avsnitt' },
            { type: 'rentekst', tekst: 'Andre avsnitt' },
            { type: 'rentekst', tekst: 'Tredje avsnitt' },
        ]);
    });

    test('håndterer flere påfølgende linjeskift som ett skille', () => {
        expect(tekstTilElementArray('Første\n\n\n\nAndre\n\n\n\n\nTredje')).toEqual([
            { type: 'rentekst', tekst: 'Første' },
            { type: 'rentekst', tekst: 'Andre' },
            { type: 'rentekst', tekst: 'Tredje' },
        ]);
    });

    test('bevarer enkelt linjeskift innenfor samme element', () => {
        expect(tekstTilElementArray('Første linje\nAndre linje\n\nNytt avsnitt')).toEqual([
            { type: 'rentekst', tekst: 'Første linje\nAndre linje' },
            { type: 'rentekst', tekst: 'Nytt avsnitt' },
        ]);
    });
});

describe('vedtaksbrevResolver', () => {
    const kjørResolver = async (
        data: VedtaksbrevFormData
    ): Promise<ReturnType<typeof vedtaksbrevResolver>> =>
        vedtaksbrevResolver(data, {}, { names: [], fields: {}, shouldUseNativeValidation: false });

    const FORVENTET_FEILMELDING = 'Du må fylle inn minst 3 tegn';

    test('passerer for gyldig data', async () => {
        const { errors } = await kjørResolver({
            hovedavsnitt: { tekst: 'noe tekst' },
            avsnitt: [
                {
                    id: 'a-1',
                    tekst: 'periodetekst',
                    påkrevdeBegrunnelser: [{ begrunnelseType: 'test', tekst: 'begrunnelse' }],
                },
            ],
        });

        expect(errors).toEqual({});
    });

    test('gir feil når hovedavsnitt har under 3 tegn', async () => {
        const { errors } = await kjørResolver({
            hovedavsnitt: { tekst: 'ab' },
            avsnitt: [],
        });

        expect(errors).toHaveProperty(['hovedavsnitt', 'tekst', 'message'], FORVENTET_FEILMELDING);
    });

    test('gir feil når avsnitt-tekst er for kort', async () => {
        const { errors } = await kjørResolver({
            hovedavsnitt: { tekst: 'noe tekst' },
            avsnitt: [{ id: 'a-1', tekst: '', påkrevdeBegrunnelser: [] }],
        });

        expect(errors).toHaveProperty(['avsnitt', 0, 'tekst', 'message'], FORVENTET_FEILMELDING);
    });

    test('gir feil når påkrevd begrunnelse er for kort', async () => {
        const { errors } = await kjørResolver({
            hovedavsnitt: { tekst: 'noe tekst' },
            avsnitt: [
                {
                    id: 'a-1',
                    tekst: 'noe tekst',
                    påkrevdeBegrunnelser: [{ begrunnelseType: 'test', tekst: '' }],
                },
            ],
        });

        expect(errors).toHaveProperty(
            ['avsnitt', 0, 'påkrevdeBegrunnelser', 0, 'tekst', 'message'],
            FORVENTET_FEILMELDING
        );
    });
});
