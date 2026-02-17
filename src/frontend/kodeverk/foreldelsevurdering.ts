export enum Foreldelsevurdering {
    IkkeVurdert = 'IKKE_VURDERT',
    Foreldet = 'FORELDET',
    IkkeForeldet = 'IKKE_FORELDET',
    Tilleggsfrist = 'TILLEGGSFRIST',
    Udefinert = 'UDEFINERT',
}

export const foreldelsevurderinger: Record<Foreldelsevurdering, string> = {
    [Foreldelsevurdering.IkkeVurdert]: 'Perioden er ikke vurdert',
    [Foreldelsevurdering.Foreldet]: 'Perioden er foreldet',
    [Foreldelsevurdering.IkkeForeldet]: 'Perioden er ikke foreldet',
    [Foreldelsevurdering.Tilleggsfrist]:
        'Perioden er ikke foreldet, regel om tilleggsfrist (10 år) benyttes',
    [Foreldelsevurdering.Udefinert]: 'Ikke Definert',
};

export const foreldelseVurderingTyper: readonly Foreldelsevurdering[] = [
    Foreldelsevurdering.IkkeForeldet,
    Foreldelsevurdering.Foreldet,
    Foreldelsevurdering.Tilleggsfrist,
];
