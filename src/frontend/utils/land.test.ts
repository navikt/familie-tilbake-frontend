import { norskLandnavn } from './land';

describe('norskLandnavn', () => {
    test('Får norske landnavn for landkoder', () => {
        expect(norskLandnavn('NO')).toBe('Norge');
        expect(norskLandnavn('SE')).toBe('Sverige');
        expect(norskLandnavn('DK')).toBe('Danmark');
    });

    test('Får landkode for ugyldig landkode', () => {
        const ugyldigKode = 'XX';
        expect(norskLandnavn(ugyldigKode)).toBe(ugyldigKode);
    });

    test('Håndterer tom streng input', () => {
        const tomString = '';
        expect(norskLandnavn(tomString)).toBe(tomString);
    });
});
