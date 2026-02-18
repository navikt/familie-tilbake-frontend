import type { Land } from '@komponenter/landvelger/Landvelger';

export const norskLandnavn = (alpha2: Land['alpha2']): string => {
    if (!alpha2 || alpha2.length === 0) {
        return alpha2;
    }
    try {
        const lokalLandnavn = new Intl.DisplayNames(['nb'], { type: 'region' }).of(alpha2);
        if (!lokalLandnavn) {
            return alpha2;
        }
        return lokalLandnavn;
    } catch (error) {
        console.error(`Feil regionskode: ${alpha2}`, error);
        return alpha2;
    }
};
