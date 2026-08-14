import type { SchemaEnum2 as Fagsystem, SchemaEnum4 } from '@/generated';

import { zSchemaEnum2 } from '@/generated/zod.gen';

import { HendelseType } from './rettsligGrunnlag';

// URL-er i omløp bruker KS for kontantstøtte, mens API-et forventer KONT
const fagsystemAliaser: Record<string, Fagsystem> = {
    KS: 'KONT',
};

export const tilFagsystem = (fagsystemParam: string | undefined): Fagsystem | undefined => {
    if (!fagsystemParam) {
        return undefined;
    }

    const fagsystem = Object.hasOwn(fagsystemAliaser, fagsystemParam)
        ? fagsystemAliaser[fagsystemParam]
        : fagsystemParam;
    const resultat = zSchemaEnum2.safeParse(fagsystem);

    return resultat.success ? resultat.data : undefined;
};

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
        (erInstitusjon && ytelse === 'BARNETRYGD') ||
        ytelse === 'TILLEGGSSTØNAD' ||
        ytelse === 'ARBEIDSAVKLARINGSPENGER'
    ) {
        return [HendelseType.Annet];
    }
    return hendelseTyperForYtelse[ytelse];
};
