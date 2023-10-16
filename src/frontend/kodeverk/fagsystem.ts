import { HendelseType } from './feilutbetalingsÅrsak';

export enum Fagsystem {
    BA = 'BA',
    EF = 'EF',
    KS = 'KONT',
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
        HendelseType.MEDLEMSKAP_BA,
        HendelseType.UTVIDET,
        HendelseType.SATSER,
        HendelseType.SMÅBARNSTILLEGG,
        HendelseType.ANNET,
    ],
    OVERGANGSSTØNAD: [
        HendelseType.MEDLEMSKAP,
        HendelseType.OPPHOLD_I_NORGE,
        HendelseType.ENSLIG_FORSØRGER,
        HendelseType.OVERGANGSSTØNAD,
        HendelseType.YRKESRETTET_AKTIVITET,
        HendelseType.STØNADSPERIODE,
        HendelseType.INNTEKT,
        HendelseType.PENSJONSYTELSER,
        HendelseType.DØDSFALL,
        HendelseType.ANNET,
    ],
    BARNETILSYN: [
        HendelseType.MEDLEMSKAP,
        HendelseType.OPPHOLD_I_NORGE,
        HendelseType.ENSLIG_FORSØRGER,
        HendelseType.STØNAD_TIL_BARNETILSYN,
        HendelseType.DØDSFALL,
        HendelseType.ANNET,
    ],
    SKOLEPENGER: [
        HendelseType.MEDLEMSKAP,
        HendelseType.OPPHOLD_I_NORGE,
        HendelseType.ENSLIG_FORSØRGER,
        HendelseType.SKOLEPENGER,
        HendelseType.DØDSFALL,
        HendelseType.ANNET,
    ],
    KONTANTSTØTTE: [
        HendelseType.VILKÅR_BARN,
        HendelseType.VILKÅR_SØKER,
        HendelseType.BARN_I_FOSTERHJEM_ELLER_INSTITUSJON,
        HendelseType.KONTANTSTØTTENS_STØRRELSE,
        HendelseType.STØTTEPERIODE,
        HendelseType.UTBETALING,
        HendelseType.KONTANTSTØTTE_FOR_ADOPTERTE_BARN,
        HendelseType.ANNET_KS,
    ],
};

export const hentHendelseTyper = (ytelse: Ytelsetype, erInstitusjon: boolean): HendelseType[] => {
    if (erInstitusjon && ytelse === Ytelsetype.BARNETRYGD) {
        return [HendelseType.ANNET];
    }
    return hendelseTyperForYtelse[ytelse];
};
