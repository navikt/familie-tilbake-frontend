export enum HendelseType {
    ANNET = 'ANNET',
    BOR_MED_SØKER = 'BOR_MED_SØKER',
    BOSATT_I_RIKET = 'BOSATT_I_RIKET',
    LOVLIG_OPPHOLD = 'LOVLIG_OPPHOLD',
    DØDSFALL = 'DØDSFALL',
    DELT_BOSTED = 'DELT_BOSTED',
    BARNS_ALDER = 'BARNS_ALDER',
}

export const hendelsetyper: Record<HendelseType, string> = {
    ANNET: 'Annet',
    BOR_MED_SØKER: 'Bor med søker',
    BOSATT_I_RIKET: 'Bosatt i riket',
    LOVLIG_OPPHOLD: 'Lovlig opphold',
    DØDSFALL: 'Dødsfall',
    DELT_BOSTED: 'Delt bosted',
    BARNS_ALDER: 'Barns alder',
};

export enum HendelseUndertype {
    ANNET_FRITEKST = 'ANNET_FRITEKST',

    BOR_IKKE_MED_BARN = 'BOR_IKKE_MED_BARN',
    BARN_FLYTTET_FRA_NORGE = 'BARN_FLYTTET_FRA_NORGE',
    BRUKER_FLYTTET_FRA_NORGE = 'BRUKER_FLYTTET_FRA_NORGE',
    BARN_BOR_IKKE_I_NORGE = 'BARN_BOR_IKKE_I_NORGE',
    BRUKER_BOR_IKKE_I_NORGE = 'BRUKER_BOR_IKKE_I_NORGE',
    UTEN_OPPHOLDSTILLATELSE = 'UTEN_OPPHOLDSTILLATELSE',
    BARN_DØD = 'BARN_DØD',
    BRUKER_DØD = 'BRUKER_DØD',
    ENIGHET_OM_OPPHØR_DELT_BOSTED = 'ENIGHET_OM_OPPHØR_DELT_BOSTED',
    UENIGHET_OM_OPPHØR_DELT_BOSTED = 'UENIGHET_OM_OPPHØR_DELT_BOSTED',
    BARN_OVER_18_ÅR = 'BARN_OVER_18_ÅR',
    BARN_OVER_6_ÅR = 'BARN_OVER_6_ÅR',
}

export const hendelseundertyper: Record<HendelseUndertype, string> = {
    ANNET_FRITEKST: 'Annet fritekst',
    BOR_IKKE_MED_BARN: 'Søker bor ikke med barn eller ikke lenger fast omsorg for barn',
    BARN_FLYTTET_FRA_NORGE: 'Barn flyttet fra Norge',
    BRUKER_FLYTTET_FRA_NORGE: 'Bruker flyttet fra Norge',
    BARN_BOR_IKKE_I_NORGE: 'Barn bor ikke i Norge',
    BRUKER_BOR_IKKE_I_NORGE: 'Bruker bor ikke i Norge',
    UTEN_OPPHOLDSTILLATELSE: 'Bruker uten oppholdstillatelse',
    BARN_DØD: 'Barnet død',
    BRUKER_DØD: 'Bruker død',
    ENIGHET_OM_OPPHØR_DELT_BOSTED: 'Enighet om opphør av avtale om delt bosted',
    UENIGHET_OM_OPPHØR_DELT_BOSTED: 'Uenighet om opphør av avtale om delt bosted',
    BARN_OVER_18_ÅR: 'Barn over 18 år',
    BARN_OVER_6_ÅR: 'Barn over 6 år',
};

const undertyper = {
    ANNET: [HendelseUndertype.ANNET_FRITEKST],
    BOR_MED_SØKER: [HendelseUndertype.BOR_IKKE_MED_BARN],
    BOSATT_I_RIKET: [
        HendelseUndertype.BARN_FLYTTET_FRA_NORGE,
        HendelseUndertype.BRUKER_FLYTTET_FRA_NORGE,
        HendelseUndertype.BARN_BOR_IKKE_I_NORGE,
        HendelseUndertype.BRUKER_BOR_IKKE_I_NORGE,
    ],
    LOVLIG_OPPHOLD: [HendelseUndertype.UTEN_OPPHOLDSTILLATELSE],
    DØDSFALL: [HendelseUndertype.BARN_DØD, HendelseUndertype.BRUKER_DØD],
    DELT_BOSTED: [
        HendelseUndertype.ENIGHET_OM_OPPHØR_DELT_BOSTED,
        HendelseUndertype.UENIGHET_OM_OPPHØR_DELT_BOSTED,
    ],
    BARNS_ALDER: [HendelseUndertype.BARN_OVER_18_ÅR, HendelseUndertype.BARN_OVER_6_ÅR],
};

export const hentHendelseUndertyper = (hendelseType: HendelseType): HendelseUndertype[] => {
    return undertyper[hendelseType];
};
