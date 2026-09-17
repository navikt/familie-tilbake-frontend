import type { VedtaksbrevFormData } from './schema';

import { describe, expect, test } from 'vitest';

import { vedtaksbrevResolver } from './schema';

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
