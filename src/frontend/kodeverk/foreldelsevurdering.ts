export enum Foreldelsevurdering {
    IKKE_VURDERT = 'IKKE_VURDERT',
    FORELDET = 'FORELDET',
    IKKE_FORELDET = 'IKKE_FORELDET',
    TILLEGGSFRIST = 'TILLEGGSFRIST',
    UDEFINERT = 'UDEFINERT',
}

export const foreldelsevurderinger = {
    IKKE_VURDERT: 'Perioden er ikke vurdert',
    FORELDET: 'Perioden er foreldet',
    IKKE_FORELDET: 'Perioden er ikke foreldet',
    TILLEGGSFRIST: 'Perioden er ikke foreldet, regel om tilleggsfrist (10 år) benyttes',
    UDEFINERT: 'Ikke Definert',
};

export const foreldelseVurderingTyper = [
    Foreldelsevurdering.FORELDET,
    Foreldelsevurdering.IKKE_FORELDET,
    Foreldelsevurdering.TILLEGGSFRIST,
];
