export enum HendelseType {
    BA_MEDLEMSKAP = 'BA_MEDLEMSKAP',
    BA_ANNET = 'BA_ANNET',
    EF_MEDLEMSKAP = 'EF_MEDLEMSKAP',
    EF_ANNET = 'EF_ANNET',
    KS_MEDLEMSKAP = 'KS_MEDLEMSKAP',
    KS_ANNET = 'KS_ANNET',
}

export const hendelseType: Record<HendelseType, string> = {
    BA_MEDLEMSKAP: 'Medlemskap',
    BA_ANNET: 'Annet',
    EF_MEDLEMSKAP: 'Medlemskap',
    EF_ANNET: 'Annet',
    KS_MEDLEMSKAP: 'Medlemskap',
    KS_ANNET: 'Annet',
};

export enum HendelseUndertype {
    DØDSFALL = 'DØDSFALL',
    UTFLYTTING = 'UTFLYTTING',
    ANNET_FRITEKST = 'ANNET_FRITEKST',
}

export const hendelseUndertype: Record<HendelseUndertype, string> = {
    DØDSFALL: 'Dødsfall',
    UTFLYTTING: 'Utflytting',
    ANNET_FRITEKST: 'Annet fritekst',
};

const undertyper = {
    BA_MEDLEMSKAP: [HendelseUndertype.DØDSFALL, HendelseUndertype.UTFLYTTING],
    BA_ANNET: [HendelseUndertype.ANNET_FRITEKST],
    EF_MEDLEMSKAP: [HendelseUndertype.DØDSFALL, HendelseUndertype.UTFLYTTING],
    EF_ANNET: [HendelseUndertype.ANNET_FRITEKST],
    KS_MEDLEMSKAP: [HendelseUndertype.DØDSFALL, HendelseUndertype.UTFLYTTING],
    KS_ANNET: [HendelseUndertype.ANNET_FRITEKST],
};

export const hentHendelseUndertyper = (hendelseType: HendelseType): HendelseUndertype[] => {
    return undertyper[hendelseType];
};
