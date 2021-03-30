export enum HendelseType {
    BA_ANNET = 'BA_ANNET',
    EF_ANNET = 'EF_ANNET',
    KS_ANNET = 'KS_ANNET',
}

export const hendelsetyper: Record<HendelseType, string> = {
    BA_ANNET: 'Annet',
    EF_ANNET: 'Annet',
    KS_ANNET: 'Annet',
};

export enum HendelseUndertype {
    ANNET_FRITEKST = 'ANNET_FRITEKST',
}

export const hendelseundertyper: Record<HendelseUndertype, string> = {
    ANNET_FRITEKST: 'Annet fritekst',
};

const undertyper = {
    BA_ANNET: [HendelseUndertype.ANNET_FRITEKST],
    EF_ANNET: [HendelseUndertype.ANNET_FRITEKST],
    KS_ANNET: [HendelseUndertype.ANNET_FRITEKST],
};

export const hentHendelseUndertyper = (hendelseType: HendelseType): HendelseUndertype[] => {
    return undertyper[hendelseType];
};
