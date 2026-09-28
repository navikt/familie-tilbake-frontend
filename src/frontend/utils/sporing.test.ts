import { vaskSporingsUrl } from './sporing';

describe('vaskSporingsUrl', () => {
    test('erstatter fagsak- og behandlings-ID-er og beholder resten av URL-en', () => {
        expect(
            vaskSporingsUrl(
                '/fagsystem/BA/fagsak/987/behandling/456/vilkaarsvurdering',
                '?periode=123'
            )
        ).toBe(
            '/fagsystem/BA/fagsak/[FAGSAK_ID]/behandling/[BEHANDLING_ID]/vilkaarsvurdering?periode=123'
        );
    });
});
