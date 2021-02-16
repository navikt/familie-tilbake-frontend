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
    BARNETRYGD: [HendelseType.BA_MEDLEMSKAP, HendelseType.BA_ANNET],
    OVERGANGSSTØNAD: [HendelseType.EF_MEDLEMSKAP, HendelseType.EF_ANNET],
    BARNETILSYN: [HendelseType.EF_MEDLEMSKAP, HendelseType.EF_ANNET],
    SKOLEPENGER: [HendelseType.EF_MEDLEMSKAP, HendelseType.EF_ANNET],
    KONTANTSTØTTE: [HendelseType.KS_MEDLEMSKAP, HendelseType.KS_ANNET],
};

export const hentHendelseTyper = (ytelse: Ytelsetype): HendelseType[] => {
    return hendelseTyperForYtelse[ytelse];
};
