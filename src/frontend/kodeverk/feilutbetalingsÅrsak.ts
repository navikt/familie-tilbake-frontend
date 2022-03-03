export enum HendelseType {
    // Felles
    ANNET = 'ANNET',
    DØDSFALL = 'DØDSFALL',
    // Barnetrygd
    BOR_MED_SØKER = 'BOR_MED_SØKER',
    BOSATT_I_RIKET = 'BOSATT_I_RIKET',
    LOVLIG_OPPHOLD = 'LOVLIG_OPPHOLD',
    DELT_BOSTED = 'DELT_BOSTED',
    BARNS_ALDER = 'BARNS_ALDER',
    // Felles Enslig forsørger
    MEDLEMSKAP = 'MEDLEMSKAP',
    OPPHOLD_I_NORGE = 'OPPHOLD_I_NORGE',
    ENSLIG_FORSØRGER = 'ENSLIG_FORSØRGER',
    // Overgangsstønad
    OVERGANGSSTØNAD = 'OVERGANGSSTØNAD',
    YRKESRETTET_AKTIVITET = 'YRKESRETTET_AKTIVITET',
    STØNADSPERIODE = 'STØNADSPERIODE',
    INNTEKT = 'INNTEKT',
    PENSJONSYTELSER = 'PENSJONSYTELSER',
    // Barnetilsyn
    STØNAD_TIL_BARNETILSYN = 'STØNAD_TIL_BARNETILSYN',
    // Skolepenger
    SKOLEPENGER = 'SKOLEPENGER',
}

export const hendelsetyper: Record<HendelseType, string> = {
    // Felles
    ANNET: 'Annet',
    DØDSFALL: 'Dødsfall',
    // Barnetrygd
    BOR_MED_SØKER: 'Bor med søker',
    BOSATT_I_RIKET: 'Bosatt i riket',
    LOVLIG_OPPHOLD: 'Lovlig opphold',
    DELT_BOSTED: 'Delt bosted',
    BARNS_ALDER: 'Barns alder',
    // Felles Enslig forsørger
    MEDLEMSKAP: '§15-2 Medlemskap',
    OPPHOLD_I_NORGE: '§15-3 Opphold i Norge',
    ENSLIG_FORSØRGER: '§15-4 Enslig forsørger',
    // Overgangsstønad
    OVERGANGSSTØNAD: '§15-5 Overgangsstønad',
    YRKESRETTET_AKTIVITET: '§15-6 Yrkesrettet aktivitet',
    STØNADSPERIODE: '§15-8 Stønadsperiode',
    INNTEKT: '§15-9 Inntekt',
    PENSJONSYTELSER: '§15-13 Pensjonsytelser',
    // Barnetilsyn
    STØNAD_TIL_BARNETILSYN: '§15-10 Stønad til barnetilsyn',
    // Skolepenger
    SKOLEPENGER: '§15-11 Skolepenger',
};

export enum HendelseUndertype {
    // Felles
    ANNET_FRITEKST = 'ANNET_FRITEKST',
    BRUKER_FLYTTET_FRA_NORGE = 'BRUKER_FLYTTET_FRA_NORGE',
    BARN_FLYTTET_FRA_NORGE = 'BARN_FLYTTET_FRA_NORGE',
    BARN_DØD = 'BARN_DØD',
    BRUKER_DØD = 'BRUKER_DØD',
    // Barnetrygd
    BOR_IKKE_MED_BARN = 'BOR_IKKE_MED_BARN',
    BARN_BOR_IKKE_I_NORGE = 'BARN_BOR_IKKE_I_NORGE',
    BRUKER_BOR_IKKE_I_NORGE = 'BRUKER_BOR_IKKE_I_NORGE',
    UTEN_OPPHOLDSTILLATELSE = 'UTEN_OPPHOLDSTILLATELSE',
    ENIGHET_OM_OPPHØR_DELT_BOSTED = 'ENIGHET_OM_OPPHØR_DELT_BOSTED',
    UENIGHET_OM_OPPHØR_DELT_BOSTED = 'UENIGHET_OM_OPPHØR_DELT_BOSTED',
    BARN_OVER_18_ÅR = 'BARN_OVER_18_ÅR',
    BARN_OVER_6_ÅR = 'BARN_OVER_6_ÅR',
    // Felles Enslig forsørger
    MEDLEM_SISTE_5_ÅR = 'MEDLEM_SISTE_5_ÅR',
    LOVLIG_OPPHOLD = 'LOVLIG_OPPHOLD',
    BRUKER_IKKE_OPPHOLD_I_NORGE = 'BRUKER_IKKE_OPPHOLD_I_NORGE',
    BARN_IKKE_OPPHOLD_I_NORGE = 'BARN_IKKE_OPPHOLD_I_NORGE',
    OPPHOLD_UTLAND_6_UKER_ELLER_MER = 'OPPHOLD_UTLAND_6_UKER_ELLER_MER',
    UGIFT = 'UGIFT',
    SEPARERT_SKILT = 'SEPARERT_SKILT',
    SAMBOER = 'SAMBOER',
    NYTT_BARN_SAMME_PARTNER = 'NYTT_BARN_SAMME_PARTNER',
    ENDRET_SAMVÆRSORDNING = 'ENDRET_SAMVÆRSORDNING',
    BARN_FLYTTET = 'BARN_FLYTTET',
    NÆRE_BOFORHOLD = 'NÆRE_BOFORHOLD',
    FORELDRE_LEVER_SAMMEN = 'FORELDRE_LEVER_SAMMEN',
    // Overgangsstønad
    BARN_8_ÅR = 'BARN_8_ÅR',
    ARBEID = 'ARBEID',
    REELL_ARBEIDSSØKER = 'REELL_ARBEIDSSØKER',
    UTDANNING = 'UTDANNING',
    ETABLERER_EGEN_VIRKSOMHET = 'ETABLERER_EGEN_VIRKSOMHET',
    HOVEDPERIODE_3_ÅR = 'HOVEDPERIODE_3_ÅR',
    UTVIDELSE_UTDANNING = 'UTVIDELSE_UTDANNING',
    UTVIDELSE_SÆRLIG_TILSYNSKREVENDE_BARN = 'UTVIDELSE_SÆRLIG_TILSYNSKREVENDE_BARN',
    UTVIDELSE_FORBIGÅENDE_SYKDOM = 'UTVIDELSE_FORBIGÅENDE_SYKDOM',
    PÅVENTE_AV_SKOLESTART_STARTET_IKKE = 'PÅVENTE_AV_SKOLESTART_STARTET_IKKE',
    PÅVENTE_SKOLESTART_STARTET_TIDLIGERE = 'PÅVENTE_SKOLESTART_STARTET_TIDLIGERE',
    PÅVENTE_ARBEIDSTILBUD_STARTET_IKKE = 'PÅVENTE_ARBEIDSTILBUD_STARTET_IKKE',
    PÅVENTE_ARBEIDSTILBUD_STARTET_TIDLIGERE = 'PÅVENTE_ARBEIDSTILBUD_STARTET_TIDLIGERE',
    PÅVENTE_BARNETILSYN_IKKE_HA_TILSYN = 'PÅVENTE_BARNETILSYN_IKKE_HA_TILSYN',
    PÅVENTE_BARNETILSYN_STARTET_TIDLIGERE = 'PÅVENTE_BARNETILSYN_STARTET_TIDLIGERE',
    ARBEIDSSØKER = 'ARBEIDSSØKER',
    ARBEIDSINNTEKT_FÅTT_INNTEKT = 'ARBEIDSINNTEKT_FÅTT_INNTEKT',
    ARBEIDSINNTEKT_ENDRET_INNTEKT = 'ARBEIDSINNTEKT_ENDRET_INNTEKT',
    ANDRE_FOLKETRYGDYTELSER = 'ANDRE_FOLKETRYGDYTELSER',
    SELVSTENDIG_NÆRINGSDRIVENDE_FÅTT_INNTEKT = 'SELVSTENDIG_NÆRINGSDRIVENDE_FÅTT_INNTEKT',
    SELVSTENDIG_NÆRINGSDRIVENDE_ENDRET_INNTEKT = 'SELVSTENDIG_NÆRINGSDRIVENDE_ENDRET_INNTEKT',
    UFØRETRYGD = 'UFØRETRYGD',
    GJENLEVENDE_EKTEFELLE = 'GJENLEVENDE_EKTEFELLE',
    // Barnetilsyn
    IKKE_ARBEID = 'IKKE_ARBEID',
    EGEN_VIRKSOMHET = 'EGEN_VIRKSOMHET',
    TILSYNSUTGIFTER_OPPHØRT = 'TILSYNSUTGIFTER_OPPHØRT',
    TILSYNSUTGIFTER_ENDRET = 'TILSYNSUTGIFTER_ENDRET',
    FORBIGÅENDE_SYKDOM = 'FORBIGÅENDE_SYKDOM',
    ETTER_4_SKOLEÅR_UTGIFTENE_OPPHØRT = 'ETTER_4_SKOLEÅR_UTGIFTENE_OPPHØRT',
    ETTER_4_SKOLEÅR_ENDRET_ARBEIDSTID = 'ETTER_4_SKOLEÅR_ENDRET_ARBEIDSTID',
    INNTEKT_OVER_6G = 'INNTEKT_OVER_6G',
    KONTANTSTØTTE = 'KONTANTSTØTTE',
    ØKT_KONTANTSTØTTE = 'ØKT_KONTANTSTØTTE',
    // Skolepenger
    IKKE_RETT_TIL_OVERGANGSSTØNAD = 'IKKE_RETT_TIL_OVERGANGSSTØNAD',
    SLUTTET_I_UTDANNING = 'SLUTTET_I_UTDANNING',
}

export const hendelseundertyper: Record<HendelseUndertype, string> = {
    // Felles
    ANNET_FRITEKST: 'Annet fritekst',
    BRUKER_FLYTTET_FRA_NORGE: 'Bruker flyttet fra Norge',
    BARN_FLYTTET_FRA_NORGE: 'Barn flyttet fra Norge',
    BARN_DØD: 'Barnet død',
    BRUKER_DØD: 'Bruker død',
    // Barnetrygd
    BOR_IKKE_MED_BARN: 'Bor ikke med barn - ikke fast omsorg',
    BARN_BOR_IKKE_I_NORGE: 'Barn bor ikke i Norge',
    BRUKER_BOR_IKKE_I_NORGE: 'Bruker bor ikke i Norge',
    UTEN_OPPHOLDSTILLATELSE: 'Bruker uten oppholdstillatelse',
    ENIGHET_OM_OPPHØR_DELT_BOSTED: 'Enighet om opphør av avtale om delt bosted',
    UENIGHET_OM_OPPHØR_DELT_BOSTED: 'Uenighet om opphør av avtale om delt bosted',
    BARN_OVER_18_ÅR: 'Barn over 18 år',
    BARN_OVER_6_ÅR: 'Barn over 6 år',
    // Felles Enslig forsørger
    MEDLEM_SISTE_5_ÅR: 'Medlem siste 5 år',
    LOVLIG_OPPHOLD: 'Lovlig opphold',
    BRUKER_IKKE_OPPHOLD_I_NORGE: 'Bruker ikke opphold i Norge',
    BARN_IKKE_OPPHOLD_I_NORGE: 'Barn ikke opphold i Norge ',
    OPPHOLD_UTLAND_6_UKER_ELLER_MER: 'Opphold utland 6 uker eller mer',
    UGIFT: 'Ugift (3. ledd)',
    SEPARERT_SKILT: 'Separert/ skilt (3. ledd)',
    SAMBOER: 'Samboer (3. ledd)',
    NYTT_BARN_SAMME_PARTNER: 'Nytt barn samme partner (3. ledd)',
    ENDRET_SAMVÆRSORDNING: 'Endret samværsordning (4.ledd)',
    BARN_FLYTTET: 'Barn flyttet (4.ledd)',
    NÆRE_BOFORHOLD: 'Nære boforhold (4.ledd)',
    FORELDRE_LEVER_SAMMEN: 'Foreldre lever sammen (4.ledd)',
    // Overgangsstønad
    BARN_8_ÅR: 'Barn 8 år (2. ledd)',
    ARBEID: 'Arbeid',
    REELL_ARBEIDSSØKER: 'Reell arbeidssøker',
    UTDANNING: 'Utdanning',
    ETABLERER_EGEN_VIRKSOMHET: 'Etablerer egen virksomhet',
    HOVEDPERIODE_3_ÅR: 'Hovedperiode 3 år (1.ledd)',
    UTVIDELSE_UTDANNING: 'Utvidelse utdanning (2. ledd)',
    UTVIDELSE_SÆRLIG_TILSYNSKREVENDE_BARN: 'Utvidelse særlig tilsynskrevende barn (3. ledd)',
    UTVIDELSE_FORBIGÅENDE_SYKDOM: 'Utvidelse, forbigående sykdom (4. ledd)',
    PÅVENTE_AV_SKOLESTART_STARTET_IKKE: 'Påvente av skolestart, startet ikke (5.ledd)',
    PÅVENTE_SKOLESTART_STARTET_TIDLIGERE: 'Påvente skolestart, startet tidligere (5.ledd)',
    PÅVENTE_ARBEIDSTILBUD_STARTET_IKKE: 'Påvente arbeidstilbud, startet ikke (5.ledd)',
    PÅVENTE_ARBEIDSTILBUD_STARTET_TIDLIGERE: 'Påvente arbeidstilbud, startet tidligere (5.ledd)',
    PÅVENTE_BARNETILSYN_IKKE_HA_TILSYN: 'Påvente barnetilsyn, ikke ha tilsyn (5.ledd)',
    PÅVENTE_BARNETILSYN_STARTET_TIDLIGERE: 'Påvente barnetilsyn, startet tidligere (5.ledd)',
    ARBEIDSSØKER: 'Reell arbeidssøker (5.ledd)',
    ARBEIDSINNTEKT_FÅTT_INNTEKT: 'Arbeidsinntekt, fått inntekt',
    ARBEIDSINNTEKT_ENDRET_INNTEKT: 'Arbeidsinntekt, endret inntekt',
    ANDRE_FOLKETRYGDYTELSER: 'Andre folketrygdytelser',
    SELVSTENDIG_NÆRINGSDRIVENDE_FÅTT_INNTEKT: 'Selvstendig næringsdrivende, fått inntekt',
    SELVSTENDIG_NÆRINGSDRIVENDE_ENDRET_INNTEKT: 'Selvstendig næringsdrivende, endret inntekt',
    UFØRETRYGD: 'Uføretrygd',
    GJENLEVENDE_EKTEFELLE: 'Gjenlevende ektefelle',
    // Barnetilsyn
    IKKE_ARBEID: 'Arbeid (1. ledd)',
    EGEN_VIRKSOMHET: 'Egen virksomhet (1. ledd)',
    TILSYNSUTGIFTER_OPPHØRT: 'Tilsynsutgifter opphørt',
    TILSYNSUTGIFTER_ENDRET: 'Tilsynsutgifter endret',
    FORBIGÅENDE_SYKDOM: 'Forbigående sykdom (2. ledd)',
    ETTER_4_SKOLEÅR_UTGIFTENE_OPPHØRT:
        'Tilsynsutgifter etter 4. skoleår, utgiftene opphørt (2. ledd)',
    ETTER_4_SKOLEÅR_ENDRET_ARBEIDSTID:
        'Tilsynsutgifter etter 4. skoleår, endret arbeidstid (2. ledd)',
    INNTEKT_OVER_6G: 'Inntekt over 6G (3. ledd)',
    KONTANTSTØTTE: 'Kontantstøtte',
    ØKT_KONTANTSTØTTE: 'Økt kontantstøtte',
    // Skolepenger
    IKKE_RETT_TIL_OVERGANGSSTØNAD: 'Ikke rett til overgangsstønad (5. ledd)',
    SLUTTET_I_UTDANNING: 'Sluttet i utdanning',
};

const undertyper = {
    // Felles
    ANNET: [HendelseUndertype.ANNET_FRITEKST],
    DØDSFALL: [HendelseUndertype.BARN_DØD, HendelseUndertype.BRUKER_DØD],
    // Barnetrygd
    BOR_MED_SØKER: [HendelseUndertype.BOR_IKKE_MED_BARN],
    BOSATT_I_RIKET: [
        HendelseUndertype.BARN_FLYTTET_FRA_NORGE,
        HendelseUndertype.BRUKER_FLYTTET_FRA_NORGE,
        HendelseUndertype.BARN_BOR_IKKE_I_NORGE,
        HendelseUndertype.BRUKER_BOR_IKKE_I_NORGE,
    ],
    LOVLIG_OPPHOLD: [HendelseUndertype.UTEN_OPPHOLDSTILLATELSE],
    DELT_BOSTED: [
        HendelseUndertype.ENIGHET_OM_OPPHØR_DELT_BOSTED,
        HendelseUndertype.UENIGHET_OM_OPPHØR_DELT_BOSTED,
    ],
    BARNS_ALDER: [HendelseUndertype.BARN_OVER_18_ÅR, HendelseUndertype.BARN_OVER_6_ÅR],
    // Felles Enslig forsørger
    MEDLEMSKAP: [HendelseUndertype.MEDLEM_SISTE_5_ÅR, HendelseUndertype.LOVLIG_OPPHOLD],
    OPPHOLD_I_NORGE: [
        HendelseUndertype.BRUKER_IKKE_OPPHOLD_I_NORGE,
        HendelseUndertype.BARN_IKKE_OPPHOLD_I_NORGE,
        HendelseUndertype.BRUKER_FLYTTET_FRA_NORGE,
        HendelseUndertype.BARN_FLYTTET_FRA_NORGE,
        HendelseUndertype.OPPHOLD_UTLAND_6_UKER_ELLER_MER,
    ],
    ENSLIG_FORSØRGER: [
        HendelseUndertype.UGIFT,
        HendelseUndertype.SEPARERT_SKILT,
        HendelseUndertype.SAMBOER,
        HendelseUndertype.NYTT_BARN_SAMME_PARTNER,
        HendelseUndertype.ENDRET_SAMVÆRSORDNING,
        HendelseUndertype.BARN_FLYTTET,
        HendelseUndertype.NÆRE_BOFORHOLD,
        HendelseUndertype.FORELDRE_LEVER_SAMMEN,
    ],
    // Overgangsstønad
    OVERGANGSSTØNAD: [HendelseUndertype.BARN_8_ÅR],
    YRKESRETTET_AKTIVITET: [
        HendelseUndertype.ARBEID,
        HendelseUndertype.REELL_ARBEIDSSØKER,
        HendelseUndertype.UTDANNING,
        HendelseUndertype.ETABLERER_EGEN_VIRKSOMHET,
    ],
    STØNADSPERIODE: [
        HendelseUndertype.HOVEDPERIODE_3_ÅR,
        HendelseUndertype.UTVIDELSE_UTDANNING,
        HendelseUndertype.UTVIDELSE_SÆRLIG_TILSYNSKREVENDE_BARN,
        HendelseUndertype.UTVIDELSE_FORBIGÅENDE_SYKDOM,
        HendelseUndertype.PÅVENTE_AV_SKOLESTART_STARTET_IKKE,
        HendelseUndertype.PÅVENTE_SKOLESTART_STARTET_TIDLIGERE,
        HendelseUndertype.PÅVENTE_ARBEIDSTILBUD_STARTET_IKKE,
        HendelseUndertype.PÅVENTE_ARBEIDSTILBUD_STARTET_TIDLIGERE,
        HendelseUndertype.PÅVENTE_BARNETILSYN_IKKE_HA_TILSYN,
        HendelseUndertype.PÅVENTE_BARNETILSYN_STARTET_TIDLIGERE,
        HendelseUndertype.ARBEIDSSØKER,
    ],
    INNTEKT: [
        HendelseUndertype.ARBEIDSINNTEKT_FÅTT_INNTEKT,
        HendelseUndertype.ARBEIDSINNTEKT_ENDRET_INNTEKT,
        HendelseUndertype.ANDRE_FOLKETRYGDYTELSER,
        HendelseUndertype.SELVSTENDIG_NÆRINGSDRIVENDE_FÅTT_INNTEKT,
        HendelseUndertype.SELVSTENDIG_NÆRINGSDRIVENDE_ENDRET_INNTEKT,
    ],
    PENSJONSYTELSER: [HendelseUndertype.UFØRETRYGD, HendelseUndertype.GJENLEVENDE_EKTEFELLE],
    // Barnetilsyn
    STØNAD_TIL_BARNETILSYN: [
        HendelseUndertype.IKKE_ARBEID,
        HendelseUndertype.EGEN_VIRKSOMHET,
        HendelseUndertype.TILSYNSUTGIFTER_OPPHØRT,
        HendelseUndertype.TILSYNSUTGIFTER_ENDRET,
        HendelseUndertype.FORBIGÅENDE_SYKDOM,
        HendelseUndertype.ETTER_4_SKOLEÅR_UTGIFTENE_OPPHØRT,
        HendelseUndertype.ETTER_4_SKOLEÅR_ENDRET_ARBEIDSTID,
        HendelseUndertype.INNTEKT_OVER_6G,
        HendelseUndertype.KONTANTSTØTTE,
        HendelseUndertype.ØKT_KONTANTSTØTTE,
    ],
    // Skolepenger
    SKOLEPENGER: [
        HendelseUndertype.IKKE_RETT_TIL_OVERGANGSSTØNAD,
        HendelseUndertype.SLUTTET_I_UTDANNING,
    ],
};

export const hentHendelseUndertyper = (hendelseType: HendelseType): HendelseUndertype[] => {
    return undertyper[hendelseType];
};
