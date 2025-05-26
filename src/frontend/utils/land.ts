import type { Land } from '../komponenter/Felleskomponenter/Landvelger/Landvelger';

export const norskLandnavn = (alpha2: Land['alpha2']): string => {
    try {
        if (!/^[A-Z]{2}$/.test(alpha2)) {
            throw new RangeError('Invalid region code format');
        }
        const lokalLandnavn = new Intl.DisplayNames(['nb'], { type: 'region' }).of(alpha2);
        return lokalLandnavn || alpha2;
    } catch (error) {
        console.error(`Feil regionskode: ${alpha2}`, error);
        return alpha2;
    }
};
