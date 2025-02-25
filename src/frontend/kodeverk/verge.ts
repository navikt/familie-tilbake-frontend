export enum Vergetype {
    VergeForBarn = 'VERGE_FOR_BARN',
    VergeForForeldreløstBarn = 'VERGE_FOR_FORELDRELØST_BARN',
    VergeForVoksen = 'VERGE_FOR_VOKSEN',
    Advokat = 'ADVOKAT',
    AnnenFullmektig = 'ANNEN_FULLMEKTIG',
    Udefinert = 'UDEFINERT',
}

export const vergetyper: Record<Vergetype, string> = {
    [Vergetype.VergeForBarn]: 'Verge for barn under 18 år',
    [Vergetype.VergeForForeldreløstBarn]: 'Verge for foreldreløst barn under 18 år',
    [Vergetype.VergeForVoksen]: 'Verge for voksen',
    [Vergetype.Advokat]: 'Advokat/advokatfullmektig',
    [Vergetype.AnnenFullmektig]: 'Annen fullmektig',
    [Vergetype.Udefinert]: 'Udefinert',
};
