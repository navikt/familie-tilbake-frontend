import { HendelseType } from './feilutbetalingsÅrsak';

export enum Fagsystem {
    BA = 'BA',
    EF = 'EF',
    KS = 'KS',
}

export enum Ytelsetype {
    BARNETRYGD = 'BARNETRYGD',
    OVERGANGSSTØNAD = 'OVERGANGSSTØNAD',
    BARNETILSYN = 'BARNETILSYN',
    SKOLEPENGER = 'SKOLEPENGER',
    KONTANTSTØTTE = 'KONTANTSTØTTE',
}

export const ytelsetype: Record<Ytelsetype, string> = {
    BARNETRYGD: 'Barnetrygd',
    OVERGANGSSTØNAD: 'Overgangsstønad',
    BARNETILSYN: 'Barnetilsyn',
    SKOLEPENGER: 'Skolepenger',
    KONTANTSTØTTE: 'Kontantstøtte',
};

const hendelseTyperForYtelse = {
    BARNETRYGD: [
        HendelseType.BOR_MED_SØKER,
        HendelseType.BOSATT_I_RIKET,
        HendelseType.LOVLIG_OPPHOLD,
        HendelseType.DØDSFALL,
        HendelseType.DELT_BOSTED,
        HendelseType.BARNS_ALDER,
        HendelseType.ANNET,
    ],
    OVERGANGSSTØNAD: [HendelseType.ANNET],
    BARNETILSYN: [HendelseType.ANNET],
    SKOLEPENGER: [HendelseType.ANNET],
    KONTANTSTØTTE: [HendelseType.ANNET],
};

export const hentHendelseTyper = (ytelse: Ytelsetype): HendelseType[] => {
    return hendelseTyperForYtelse[ytelse];
};
