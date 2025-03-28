import type { Land } from '../komponenter/Felleskomponenter/Landvelger/Landvelger';

export const norskLandnavn = (alpha2: Land['alpha2']): string => {
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
