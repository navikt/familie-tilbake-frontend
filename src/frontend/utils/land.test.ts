import { norskLandnavn } from './land';

describe('norskLandnavn', () => {
    test('får norske landnavn for landkoder', () => {
        expect(norskLandnavn('NO')).toBe('Norge');
        expect(norskLandnavn('SE')).toBe('Sverige');
        expect(norskLandnavn('DK')).toBe('Danmark');
    });

    test('får landkode for ugyldig landkode', () => {
        const ugyldigKode = 'XX';
        expect(norskLandnavn(ugyldigKode)).toBe(ugyldigKode);
    });

    test('håndterer tom streng input', () => {
        const tomString = '';
        expect(norskLandnavn(tomString)).toBe(tomString);
    });
});
