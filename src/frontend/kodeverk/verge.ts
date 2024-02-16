export enum Vergetype {
    VERGE_FOR_BARN = 'VERGE_FOR_BARN',
    VERGE_FOR_FORELDRELØST_BARN = 'VERGE_FOR_FORELDRELØST_BARN',
    VERGE_FOR_VOKSEN = 'VERGE_FOR_VOKSEN',
    ADVOKAT = 'ADVOKAT',
    ANNEN_FULLMEKTIG = 'ANNEN_FULLMEKTIG',
    UDEFINERT = 'UDEFINERT',
}

export const vergetyper: Record<Vergetype, string> = {
    VERGE_FOR_BARN: 'Verge for barn under 18 år',
    VERGE_FOR_FORELDRELØST_BARN: 'Verge for foreldreløst barn under 18 år',
    VERGE_FOR_VOKSEN: 'Verge for voksen',
    ADVOKAT: 'Advokat/advokatfullmektig',
    ANNEN_FULLMEKTIG: 'Annen fullmektig',
    UDEFINERT: 'Udefinert',
};
