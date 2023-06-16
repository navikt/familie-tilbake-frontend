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
    MEDLEMSKAP_BA = 'MEDLEMSKAP_BA',
    UTVIDET = 'UTVIDET',
    SATSER = 'SATSER',
    SMÅBARNSTILLEGG = 'SMÅBARNSTILLEGG',
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
    // Kontantstøtte
    VILKÅR_BARN = 'VILKÅR_BARN',
    VILKÅR_SØKER = 'VILKÅR_SØKER',
    BARN_I_FOSTERHJEM_ELLER_INSTITUSJON = 'BARN_I_FOSTERHJEM_ELLER_INSTITUSJON',
    KONTANTSTØTTENS_STØRRELSE = 'KONTANTSTØTTENS_STØRRELSE',
    STØTTEPERIODE = 'STØTTEPERIODE',
    UTBETALING = 'UTBETALING',
    KONTANTSTØTTE_FOR_ADOPTERTE_BARN = 'KONTANTSTØTTE_FOR_ADOPTERTE_BARN',
    ANNET_KS = 'ANNET_KS',
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
    MEDLEMSKAP_BA: 'Medlemskap',
    UTVIDET: 'Utvidet',
    SATSER: 'Satser',
    SMÅBARNSTILLEGG: 'Småbarnstillegg',
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
    // Kontantstøtte
    VILKÅR_BARN: '§2 Vilkår barn',
    VILKÅR_SØKER: '§3 Vilkår søker (støttemottaker)',
    BARN_I_FOSTERHJEM_ELLER_INSTITUSJON: '§6 Barn i fosterhjem eller institusjon',
    KONTANTSTØTTENS_STØRRELSE: '§7 Kontantstøttens størrelse',
    STØTTEPERIODE: '§8 Støtteperiode',
    UTBETALING: '§9 Utbetaling',
    KONTANTSTØTTE_FOR_ADOPTERTE_BARN: '§10 Kontantstøtte for adopterte barn',
    ANNET_KS: 'Annet',
};

export enum HendelseUndertype {
    // Felles
    ANNET_FRITEKST = 'ANNET_FRITEKST',
    BRUKER_FLYTTET_FRA_NORGE = 'BRUKER_FLYTTET_FRA_NORGE',
    BARN_DØD = 'BARN_DØD',
    BRUKER_DØD = 'BRUKER_DØD',
    // Barnetrygd
    BRUKER_OG_BARN_FLYTTET_FRA_NORGE = 'BRUKER_OG_BARN_FLYTTET_FRA_NORGE',
    BRUKER_OG_BARN_BOR_IKKE_I_NORGE = 'BRUKER_OG_BARN_BOR_IKKE_I_NORGE',
    BOR_IKKE_MED_BARN = 'BOR_IKKE_MED_BARN',
    BARN_BOR_IKKE_I_NORGE = 'BARN_BOR_IKKE_I_NORGE',
    BRUKER_BOR_IKKE_I_NORGE = 'BRUKER_BOR_IKKE_I_NORGE',
    UTEN_OPPHOLDSTILLATELSE = 'UTEN_OPPHOLDSTILLATELSE',
    ENIGHET_OM_OPPHØR_DELT_BOSTED = 'ENIGHET_OM_OPPHØR_DELT_BOSTED',
    UENIGHET_OM_OPPHØR_DELT_BOSTED = 'UENIGHET_OM_OPPHØR_DELT_BOSTED',
    FLYTTET_SAMMEN = 'FLYTTET_SAMMEN',
    BARN_OVER_18_ÅR = 'BARN_OVER_18_ÅR',
    BARN_OVER_6_ÅR = 'BARN_OVER_6_ÅR',
    UTENLANDS_IKKE_MEDLEM = 'UTENLANDS_IKKE_MEDLEM',
    MEDLEMSKAP_OPPHØRT = 'MEDLEMSKAP_OPPHØRT',
    ANNEN_FORELDER_IKKE_MEDLEM = 'ANNEN_FORELDER_IKKE_MEDLEM',
    ANNEN_FORELDER_OPPHØRT_MEDLEMSKAP = 'ANNEN_FORELDER_OPPHØRT_MEDLEMSKAP',
    FLERE_UTENLANDSOPPHOLD = 'FLERE_UTENLANDSOPPHOLD',
    BOSATT_IKKE_MEDLEM = 'BOSATT_IKKE_MEDLEM',
    GIFT = 'GIFT',
    NYTT_BARN = 'NYTT_BARN',
    SAMBOER_12_MÅNEDER = 'SAMBOER_12_MÅNEDER',
    FLYTTET_SAMMEN_ANNEN_FORELDER = 'FLYTTET_SAMMEN_ANNEN_FORELDER',
    FLYTTET_SAMMEN_EKTEFELLE = 'FLYTTET_SAMMEN_EKTEFELLE',
    FLYTTET_SAMMEN_SAMBOER = 'FLYTTET_SAMMEN_SAMBOER',
    GIFT_IKKE_EGEN_HUSHOLDNING = 'GIFT_IKKE_EGEN_HUSHOLDNING',
    SAMBOER_IKKE_EGEN_HUSHOLDNING = 'SAMBOER_IKKE_EGEN_HUSHOLDNING',
    EKTEFELLE_AVSLUTTET_SONING = 'EKTEFELLE_AVSLUTTET_SONING',
    SAMBOER_AVSLUTTET_SONING = 'SAMBOER_AVSLUTTET_SONING',
    EKTEFELLE_INSTITUSJON = 'EKTEFELLE_INSTITUSJON',
    SAMBOER_INSTITUSJON = 'SAMBOER_INSTITUSJON',
    SATSENDRING = 'SATSENDRING',
    SMÅBARNSTILLEGG_3_ÅR = 'SMÅBARNSTILLEGG_3_ÅR',
    SMÅBARNSTILLEGG_OVERGANGSSTØNAD = 'SMÅBARNSTILLEGG_OVERGANGSSTØNAD',
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
    BARN_FYLT_1_ÅR = 'BARN_FYLT_1_ÅR',
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
    // Kontanstøtte
    FULLTID_BARNEHAGEPLASS = 'FULLTID_BARNEHAGEPLASS',
    OVER_2_ÅR = 'OVER_2_ÅR',
    BARN_IKKE_BOSATT = 'BARN_IKKE_BOSATT',
    BARN_IKKE_OPPHOLDSTILLATELSE = 'BARN_IKKE_OPPHOLDSTILLATELSE',
    BARN_FLYTTET_FRA_NORGE = 'BARN_FLYTTET_FRA_NORGE',
    BARN_OVER_2_ÅR = 'BARN_OVER_2_ÅR',
    DEN_ANDRE_FORELDEREN_IKKE_MEDLEM_FOLKETRYGDEN = 'DEN_ANDRE_FORELDEREN_IKKE_MEDLEM_FOLKETRYGDEN',
    DEN_ANDRE_FORELDEREN_IKKE_MEDLEM_FOLKETRYGDEN_ELLER_EØS = 'DEN_ANDRE_FORELDEREN_IKKE_MEDLEM_FOLKETRYGDEN_ELLER_EØS',
    SØKER_IKKE_MEDLEM_FOLKETRYGDEN = 'SØKER_IKKE_MEDLEM_FOLKETRYGDEN',
    SØKER_IKKE_MEDLEM_FOLKETRYGDEN_ELLER_EØS = 'SØKER_IKKE_MEDLEM_FOLKETRYGDEN_ELLER_EØS',
    BEGGE_FORELDRENE_IKKE_MEDLEM_FOLKETRYGDEN = 'BEGGE_FORELDRENE_IKKE_MEDLEM_FOLKETRYGDEN',
    BEGGE_FORELDRENE_IKKE_MEDLEM_FOLKETRYGDEN_ELLER_EØS = 'BEGGE_FORELDRENE_IKKE_MEDLEM_FOLKETRYGDEN_ELLER_EØS',
    BARN_BOR_IKKE_HOS_SØKER = 'BARN_BOR_IKKE_HOS_SØKER',
    UTENLANDSOPPHOLD_OVER_3_MÅNEDER = 'UTENLANDSOPPHOLD_OVER_3_MÅNEDER',
    SØKER_FLYTTET_FRA_NORGE = 'SØKER_FLYTTET_FRA_NORGE',
    SØKER_IKKE_BOSATT = 'SØKER_IKKE_BOSATT',
    SØKER_IKKE_OPPHOLDSTILLATELSE = 'SØKER_IKKE_OPPHOLDSTILLATELSE',
    SØKER_IKKE_OPPHOLDSTILLATELSE_I_MER_ENN_12_MÅNEDER = 'SØKER_IKKE_OPPHOLDSTILLATELSE_I_MER_ENN_12_MÅNEDER',
    BARN_I_FOSTERHJEM = 'BARN_I_FOSTERHJEM',
    BARN_I_INSTITUSJON = 'BARN_I_INSTITUSJON',
    FULLTIDSPLASS_BARNEHAGE = 'FULLTIDSPLASS_BARNEHAGE',
    DELTIDSPLASS_BARNEHAGEPLASS = 'DELTIDSPLASS_BARNEHAGEPLASS',
    ØKT_TIMEANTALL_I_BARNEHAGE = 'ØKT_TIMEANTALL_I_BARNEHAGE',
    BARN_2_ÅR = 'BARN_2_ÅR',
    DELT_BOSTED_AVTALE_OPPHØRT = 'DELT_BOSTED_AVTALE_OPPHØRT',
    DOBBELUTBETALING = 'DOBBELUTBETALING',
    MER_ENN_11_MÅNEDER = 'MER_ENN_11_MÅNEDER',
    BARN_STARTET_PÅ_SKOLEN = 'BARN_STARTET_PÅ_SKOLEN',
}

export const hendelseundertyper: Record<HendelseUndertype, string> = {
    // Felles
    ANNET_FRITEKST: 'Annet fritekst',
    BRUKER_FLYTTET_FRA_NORGE: 'Bruker flyttet fra Norge',
    BARN_FLYTTET_FRA_NORGE: 'Barn flyttet fra Norge',
    BARN_DØD: 'Barnet død',
    BRUKER_DØD: 'Bruker død',
    // Barnetrygd
    BRUKER_OG_BARN_FLYTTET_FRA_NORGE: 'Bruker og barn flyttet fra Norge',
    BRUKER_OG_BARN_BOR_IKKE_I_NORGE: 'Bruker og barn bor ikke i Norge',
    BOR_IKKE_MED_BARN: 'Bor ikke med barn - ikke fast omsorg',
    BARN_BOR_IKKE_I_NORGE: 'Barn bor ikke i Norge',
    BRUKER_BOR_IKKE_I_NORGE: 'Bruker bor ikke i Norge',
    UTEN_OPPHOLDSTILLATELSE: 'Bruker uten oppholdstillatelse',
    ENIGHET_OM_OPPHØR_DELT_BOSTED: 'Enighet om opphør av avtale om delt bosted',
    UENIGHET_OM_OPPHØR_DELT_BOSTED: 'Uenighet om opphør av avtale om delt bosted',
    FLYTTET_SAMMEN: 'Flyttet sammen',
    BARN_OVER_18_ÅR: 'Barn over 18 år',
    BARN_OVER_6_ÅR: 'Barn over 6 år',
    UTENLANDS_IKKE_MEDLEM: 'Utenlands ikke medlem',
    MEDLEMSKAP_OPPHØRT: 'Medlemskap opphørt',
    ANNEN_FORELDER_IKKE_MEDLEM: 'Den andre forelderen ikke medlem',
    ANNEN_FORELDER_OPPHØRT_MEDLEMSKAP: 'Den andre forelderen opphørt medlemskap',
    FLERE_UTENLANDSOPPHOLD: 'Flere utenlandsopphold',
    BOSATT_IKKE_MEDLEM: 'Bosatt ikke medlem',
    GIFT: 'Gift',
    NYTT_BARN: 'Nytt barn',
    SAMBOER_12_MÅNEDER: 'Samboer mer enn 12 måneder',
    FLYTTET_SAMMEN_ANNEN_FORELDER: 'Flyttet sammen annen forelder',
    FLYTTET_SAMMEN_EKTEFELLE: 'Flyttet sammen ektefelle',
    FLYTTET_SAMMEN_SAMBOER: 'Flyttet sammen samboer',
    GIFT_IKKE_EGEN_HUSHOLDNING: 'Gift ikke egen husholdning',
    SAMBOER_IKKE_EGEN_HUSHOLDNING: 'Samboer ikke egen husholdning',
    EKTEFELLE_AVSLUTTET_SONING: 'Ektefelle avsluttet soning',
    SAMBOER_AVSLUTTET_SONING: 'Samboer avsluttet soning',
    EKTEFELLE_INSTITUSJON: 'Ektefelle institusjon',
    SAMBOER_INSTITUSJON: 'Samboer institusjon',
    SATSENDRING: 'Satsendring',
    SMÅBARNSTILLEGG_3_ÅR: 'Småbarnstillegg 3 år',
    SMÅBARNSTILLEGG_OVERGANGSSTØNAD: 'Småbarnstillegg overgangsstønad',
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
    BARN_FYLT_1_ÅR: 'Barn fylt 1 år',
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
    // Kontantstøtte
    FULLTID_BARNEHAGEPLASS: 'Fulltid barnehageplass',
    OVER_2_ÅR: 'Barn over 2 år',
    BARN_IKKE_BOSATT: 'Barn ikke bosatt',
    BARN_IKKE_OPPHOLDSTILLATELSE: 'Barn ikke oppholdstillatelse',
    BARN_OVER_2_ÅR: 'Barn over 2 år',
    DEN_ANDRE_FORELDEREN_IKKE_MEDLEM_FOLKETRYGDEN: 'Den andre forelderen ikke medlem folketrygden',
    DEN_ANDRE_FORELDEREN_IKKE_MEDLEM_FOLKETRYGDEN_ELLER_EØS:
        'Den andre forelderen ikke medlem folketrygden eller EØS',
    SØKER_IKKE_MEDLEM_FOLKETRYGDEN: 'Søker ikke medlem folketrygden',
    SØKER_IKKE_MEDLEM_FOLKETRYGDEN_ELLER_EØS: 'Søker ikke medlem folketrygden eller EØS',
    BEGGE_FORELDRENE_IKKE_MEDLEM_FOLKETRYGDEN: 'Begge foreldrene ikke medlem folketrygden',
    BEGGE_FORELDRENE_IKKE_MEDLEM_FOLKETRYGDEN_ELLER_EØS:
        'Begge foreldrene ikke medlem folketrygden eller EØS',
    BARN_BOR_IKKE_HOS_SØKER: 'Barn bor ikke hos søker',
    UTENLANDSOPPHOLD_OVER_3_MÅNEDER: 'Utenlandsopphold over 3 måneder',
    SØKER_FLYTTET_FRA_NORGE: 'Søker flyttet fra Norge',
    SØKER_IKKE_BOSATT: 'Søker ikke bosatt',
    SØKER_IKKE_OPPHOLDSTILLATELSE: 'Søker ikke oppholdstillatelse',
    SØKER_IKKE_OPPHOLDSTILLATELSE_I_MER_ENN_12_MÅNEDER:
        'Søker ikke oppholdstillatelse i mer enn 12 måneder',
    BARN_I_FOSTERHJEM: 'Barn i fosterhjem',
    BARN_I_INSTITUSJON: 'Barn i institusjon',
    FULLTIDSPLASS_BARNEHAGE: 'Fulltidsplass barnehage',
    DELTIDSPLASS_BARNEHAGEPLASS: 'Deltidsplass barnehageplass',
    ØKT_TIMEANTALL_I_BARNEHAGE: 'Økt timeantall i barnehage',
    BARN_2_ÅR: 'Barn 2 år',
    DELT_BOSTED_AVTALE_OPPHØRT: 'Delt bosted, avtale opphørt',
    DOBBELUTBETALING: 'Dobbelutbetaling',
    MER_ENN_11_MÅNEDER: 'Mer enn 11 måneder',
    BARN_STARTET_PÅ_SKOLEN: 'Barn startet på skolen',
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
        HendelseUndertype.BRUKER_OG_BARN_FLYTTET_FRA_NORGE,
        HendelseUndertype.BARN_BOR_IKKE_I_NORGE,
        HendelseUndertype.BRUKER_BOR_IKKE_I_NORGE,
        HendelseUndertype.BRUKER_OG_BARN_BOR_IKKE_I_NORGE,
    ],
    LOVLIG_OPPHOLD: [HendelseUndertype.UTEN_OPPHOLDSTILLATELSE],
    DELT_BOSTED: [
        HendelseUndertype.ENIGHET_OM_OPPHØR_DELT_BOSTED,
        HendelseUndertype.UENIGHET_OM_OPPHØR_DELT_BOSTED,
        HendelseUndertype.FLYTTET_SAMMEN,
    ],
    BARNS_ALDER: [HendelseUndertype.BARN_OVER_18_ÅR, HendelseUndertype.BARN_OVER_6_ÅR],
    MEDLEMSKAP_BA: [
        HendelseUndertype.UTENLANDS_IKKE_MEDLEM,
        HendelseUndertype.MEDLEMSKAP_OPPHØRT,
        HendelseUndertype.ANNEN_FORELDER_IKKE_MEDLEM,
        HendelseUndertype.ANNEN_FORELDER_OPPHØRT_MEDLEMSKAP,
        HendelseUndertype.FLERE_UTENLANDSOPPHOLD,
        HendelseUndertype.BOSATT_IKKE_MEDLEM,
    ],
    UTVIDET: [
        HendelseUndertype.GIFT,
        HendelseUndertype.NYTT_BARN,
        HendelseUndertype.SAMBOER_12_MÅNEDER,
        HendelseUndertype.FLYTTET_SAMMEN_ANNEN_FORELDER,
        HendelseUndertype.FLYTTET_SAMMEN_EKTEFELLE,
        HendelseUndertype.FLYTTET_SAMMEN_SAMBOER,
        HendelseUndertype.GIFT_IKKE_EGEN_HUSHOLDNING,
        HendelseUndertype.SAMBOER_IKKE_EGEN_HUSHOLDNING,
        HendelseUndertype.EKTEFELLE_AVSLUTTET_SONING,
        HendelseUndertype.SAMBOER_AVSLUTTET_SONING,
        HendelseUndertype.EKTEFELLE_INSTITUSJON,
        HendelseUndertype.SAMBOER_INSTITUSJON,
    ],
    SATSER: [HendelseUndertype.SATSENDRING],
    SMÅBARNSTILLEGG: [
        HendelseUndertype.SMÅBARNSTILLEGG_3_ÅR,
        HendelseUndertype.SMÅBARNSTILLEGG_OVERGANGSSTØNAD,
    ],
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
        HendelseUndertype.BARN_FYLT_1_ÅR,
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
    VILKÅR_BARN: [
        HendelseUndertype.FULLTIDSPLASS_BARNEHAGE,
        HendelseUndertype.DELTIDSPLASS_BARNEHAGEPLASS,
        HendelseUndertype.BARN_IKKE_BOSATT,
        HendelseUndertype.BARN_IKKE_OPPHOLDSTILLATELSE,
        HendelseUndertype.BARN_FLYTTET_FRA_NORGE,
        HendelseUndertype.BARN_OVER_2_ÅR,
    ],
    VILKÅR_SØKER: [
        HendelseUndertype.DEN_ANDRE_FORELDEREN_IKKE_MEDLEM_FOLKETRYGDEN,
        HendelseUndertype.DEN_ANDRE_FORELDEREN_IKKE_MEDLEM_FOLKETRYGDEN_ELLER_EØS,
        HendelseUndertype.SØKER_IKKE_MEDLEM_FOLKETRYGDEN,
        HendelseUndertype.SØKER_IKKE_MEDLEM_FOLKETRYGDEN_ELLER_EØS,
        HendelseUndertype.BEGGE_FORELDRENE_IKKE_MEDLEM_FOLKETRYGDEN,
        HendelseUndertype.BEGGE_FORELDRENE_IKKE_MEDLEM_FOLKETRYGDEN_ELLER_EØS,
        HendelseUndertype.BARN_BOR_IKKE_HOS_SØKER,
        HendelseUndertype.UTENLANDSOPPHOLD_OVER_3_MÅNEDER,
        HendelseUndertype.SØKER_FLYTTET_FRA_NORGE,
        HendelseUndertype.SØKER_IKKE_BOSATT,
        HendelseUndertype.SØKER_IKKE_OPPHOLDSTILLATELSE,
        HendelseUndertype.SØKER_IKKE_OPPHOLDSTILLATELSE_I_MER_ENN_12_MÅNEDER,
    ],
    BARN_I_FOSTERHJEM_ELLER_INSTITUSJON: [
        HendelseUndertype.BARN_I_FOSTERHJEM,
        HendelseUndertype.BARN_I_INSTITUSJON,
    ],
    KONTANTSTØTTENS_STØRRELSE: [
        HendelseUndertype.FULLTIDSPLASS_BARNEHAGE,
        HendelseUndertype.DELTIDSPLASS_BARNEHAGEPLASS,
        HendelseUndertype.ØKT_TIMEANTALL_I_BARNEHAGE,
        HendelseUndertype.SATSENDRING,
    ],
    STØTTEPERIODE: [HendelseUndertype.BARN_2_ÅR],
    UTBETALING: [HendelseUndertype.DELT_BOSTED_AVTALE_OPPHØRT, HendelseUndertype.DOBBELUTBETALING],
    KONTANTSTØTTE_FOR_ADOPTERTE_BARN: [
        HendelseUndertype.MER_ENN_11_MÅNEDER,
        HendelseUndertype.BARN_STARTET_PÅ_SKOLEN,
    ],
    ANNET_KS: [
        HendelseUndertype.ANNET_FRITEKST,
        HendelseUndertype.BARN_DØD,
        HendelseUndertype.BRUKER_DØD,
    ],
};

export const hentHendelseUndertyper = (hendelseType: HendelseType): HendelseUndertype[] => {
    return undertyper[hendelseType];
};
