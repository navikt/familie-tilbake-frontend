import type { SchemaEnum4 } from '~/generated';

import { HendelseType } from './rettsligGrunnlag';

export enum Fagsystem {
    BA = 'BA',
    EF = 'EF',
    KS = 'KONT',
    TS = 'TS',
    AAP = 'AAP',
}

export enum Ytelsetype {
    Barnetrygd = 'BARNETRYGD',
    Overgangsstønad = 'OVERGANGSSTØNAD',
    Barnetilsyn = 'BARNETILSYN',
    Skolepenger = 'SKOLEPENGER',
    Kontantstøtte = 'KONTANTSTØTTE',
    Tilleggsstønad = 'TILLEGGSSTØNAD',
    Arbeidsavklaringspenger = 'ARBEIDSAVKLARINGSPENGER',
}

const hendelseTyperForYtelse: Record<string, HendelseType[]> = {
    BARNETRYGD: [
        HendelseType.BorMedSøker,
        HendelseType.BosattIRiket,
        HendelseType.LovligOpphold,
        HendelseType.Dødsfall,
        HendelseType.DeltBosted,
        HendelseType.BarnsAlder,
        HendelseType.MedlemskapBA,
        HendelseType.Utvidet,
        HendelseType.Satser,
        HendelseType.Småbarnstillegg,
        HendelseType.Annet,
    ],
    OVERGANGSSTØNAD: [
        HendelseType.Medlemskap,
        HendelseType.OppholdINorge,
        HendelseType.EnsligForsørger,
        HendelseType.Overgangsstønad,
        HendelseType.YrkesrettetAktivitet,
        HendelseType.Stønadsperiode,
        HendelseType.Inntekt,
        HendelseType.Pensjonsytelser,
        HendelseType.Dødsfall,
        HendelseType.Annet,
    ],
    BARNETILSYN: [
        HendelseType.Medlemskap,
        HendelseType.OppholdINorge,
        HendelseType.EnsligForsørger,
        HendelseType.StønadTilBarnetilsyn,
        HendelseType.Dødsfall,
        HendelseType.Annet,
    ],
    SKOLEPENGER: [
        HendelseType.Medlemskap,
        HendelseType.OppholdINorge,
        HendelseType.EnsligForsørger,
        HendelseType.Skolepenger,
        HendelseType.Dødsfall,
        HendelseType.Annet,
    ],
    KONTANTSTØTTE: [
        HendelseType.VilkårBarn,
        HendelseType.VilkårSøker,
        HendelseType.BarnIFosterhjemEllerInstitusjon,
        HendelseType.KontantstøttensStørrelse,
        HendelseType.Støtteperiode,
        HendelseType.Utbetaling,
        HendelseType.KontantstøtteForAdopterteBarn,
        HendelseType.AnnetKS,
    ],
};

export const hentHendelseTyper = (ytelse: SchemaEnum4, erInstitusjon: boolean): HendelseType[] => {
    if (
        (erInstitusjon && ytelse === Ytelsetype.Barnetrygd) ||
        ytelse === Ytelsetype.Tilleggsstønad ||
        ytelse === Ytelsetype.Arbeidsavklaringspenger
    ) {
        return [HendelseType.Annet];
    }
    return hendelseTyperForYtelse[ytelse];
};
