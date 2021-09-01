export enum Vergetype {
    VERGE_FOR_BARN = 'VERGE_FOR_BARN',
    VERGE_FOR_FORELDRELØST_BARN = 'VERGE_FOR_FORELDRELØST_BARN',
    VERGE_FOR_VOKSEN = 'VERGE_FOR_VOKSEN',
    ADVOKAT = 'ADVOKAT',
    ANNEN_FULLMEKTIG = 'ANNEN_FULLMEKTIG',
}

export const vergetyper: Record<Vergetype, string> = {
    VERGE_FOR_BARN: 'Verge for barn under 18 år',
    VERGE_FOR_FORELDRELØST_BARN: 'Verge for foreldreløst barn under 18 år',
    VERGE_FOR_VOKSEN: 'Verge for voksen',
    ADVOKAT: 'Advokat/advokatfullmektig',
    ANNEN_FULLMEKTIG: 'Annen fullmektig',
};

export const vergeTyper = [
    Vergetype.VERGE_FOR_BARN,
    Vergetype.VERGE_FOR_FORELDRELØST_BARN,
    Vergetype.VERGE_FOR_VOKSEN,
    Vergetype.ADVOKAT,
    Vergetype.ANNEN_FULLMEKTIG,
];
