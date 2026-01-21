import type {
    BrukeruttalelseDto,
    ForhåndsvarselDto,
    ForhåndsvarselUnntakDto,
    FristUtsettelseDto,
    Uttalelsesdetaljer,
} from '../../../generated';

import { z } from 'zod';

import { zBegrunnelseForUnntakEnum } from '../../../generated/zod.gen';

export enum SkalSendesForhåndsvarsel {
    Ja = 'ja',
    Nei = 'nei',
    Sendt = 'sendt',
    IkkeValgt = '',
}

export enum HarUttaltSeg {
    Ja = 'ja',
    Nei = 'nei',
    UtsettFrist = 'utsett_frist',
    IkkeValgt = '',
}

const fritekstSchema = z
    .string()
    .trim()
    .min(1, 'Du må fylle inn en verdi')
    .max(4000, 'Maksimalt 4000 tegn tillatt');

const uttalelsesDetaljerSchema = z.object({
    uttalelsesdato: z.iso.date({ error: 'Du må skrive en dato på denne måten: dd.mm.åååå' }),
    hvorBrukerenUttalteSeg: fritekstSchema,
    uttalelseBeskrivelse: fritekstSchema,
});

const harUttaltSegSchema = z.object({
    harUttaltSeg: z.literal(HarUttaltSeg.Ja),
    uttalelsesDetaljer: z.array(uttalelsesDetaljerSchema),
});

const harIkkeUttaltSegSchema = z.object({
    harUttaltSeg: z.literal(HarUttaltSeg.Nei),
    kommentar: fritekstSchema,
});

const utsettUttalelseFristSchema = z.object({
    nyFrist: z.iso.date({ error: 'Du må legge inn en gyldig dato' }),
    begrunnelse: fritekstSchema,
});

const utsettFristSchema = z.object({
    harUttaltSeg: z.literal(HarUttaltSeg.UtsettFrist),
    utsettUttalelseFrist: utsettUttalelseFristSchema,
});

const ikkeValgtUttalelseSchema = z.object({
    harUttaltSeg: z.literal(HarUttaltSeg.IkkeValgt),
});

const uttalelseMedFristSchemaBase = z.discriminatedUnion('harUttaltSeg', [
    harUttaltSegSchema,
    harIkkeUttaltSegSchema,
    utsettFristSchema,
    ikkeValgtUttalelseSchema,
]);

export const uttalelseMedFristSchema = uttalelseMedFristSchemaBase.refine(
    data => data.harUttaltSeg !== HarUttaltSeg.IkkeValgt,
    {
        message: 'Du må velge om brukeren har uttalt seg', // eller om fristen skal utsettes', Tas med når toggle fjernes
        path: ['harUttaltSeg'],
    }
);

const getJaUttalelseValues = (
    uttalelse: BrukeruttalelseDto | undefined
): UttalelseMedFristFormData => {
    return {
        harUttaltSeg: HarUttaltSeg.Ja,
        uttalelsesDetaljer: uttalelse?.uttalelsesdetaljer?.map((uttalelse: Uttalelsesdetaljer) => ({
            uttalelsesdato: uttalelse.uttalelsesdato,
            hvorBrukerenUttalteSeg: uttalelse.hvorBrukerenUttalteSeg,
            uttalelseBeskrivelse: uttalelse.uttalelseBeskrivelse,
        })) || [
            {
                hvorBrukerenUttalteSeg: '',
                uttalelsesdato: '',
                uttalelseBeskrivelse: '',
            },
        ],
    };
};

const getNeiUttalelseValues = (
    uttalelse: BrukeruttalelseDto | undefined
): UttalelseMedFristFormData => {
    return {
        harUttaltSeg: HarUttaltSeg.Nei,
        kommentar: uttalelse?.kommentar || '',
    };
};

const getUtsettUttalelseValues = (
    utsettelser: FristUtsettelseDto[] | undefined
): UttalelseMedFristFormData => {
    const utsettelse = utsettelser?.[0];
    return {
        harUttaltSeg: HarUttaltSeg.UtsettFrist,
        utsettUttalelseFrist: {
            nyFrist: utsettelse?.nyFrist ?? '',
            begrunnelse: utsettelse?.begrunnelse ?? '',
        },
    };
};

export const getUttalelseValuesBasertPåValg = (
    harUttaltSeg: HarUttaltSeg,
    forhåndsvarselInfo: ForhåndsvarselDto | undefined
): UttalelseMedFristFormData => {
    switch (harUttaltSeg) {
        case HarUttaltSeg.Ja:
            return getJaUttalelseValues(forhåndsvarselInfo?.brukeruttalelse);
        case HarUttaltSeg.Nei:
            return getNeiUttalelseValues(forhåndsvarselInfo?.brukeruttalelse);
        case HarUttaltSeg.UtsettFrist:
            return getUtsettUttalelseValues(forhåndsvarselInfo?.utsettUttalelseFrist);
        default:
            return {
                harUttaltSeg: HarUttaltSeg.IkkeValgt,
            };
    }
};

export const getUttalelseValues = (
    forhåndsvarselInfo: ForhåndsvarselDto | undefined
): UttalelseMedFristFormData => {
    if (forhåndsvarselInfo?.brukeruttalelse?.uttalelsesdetaljer?.length) {
        return getJaUttalelseValues(forhåndsvarselInfo.brukeruttalelse);
    }

    if (forhåndsvarselInfo?.brukeruttalelse?.kommentar) {
        return getNeiUttalelseValues(forhåndsvarselInfo.brukeruttalelse);
    }

    if (forhåndsvarselInfo?.utsettUttalelseFrist?.length) {
        return getUtsettUttalelseValues(forhåndsvarselInfo.utsettUttalelseFrist);
    }

    return {
        harUttaltSeg: HarUttaltSeg.IkkeValgt,
    };
};

// const uttalelseSchema = z
//     .discriminatedUnion('harUttaltSeg', [
//         harIkkeUttaltSegSchema,
//         harUttaltSegSchema,
//         ikkeValgtUttalelseSchema,
//     ])
//     .refine(data => data.harUttaltSeg !== HarUttaltSeg.IkkeValgt, {
//         message: 'Du må velge om brukeren har uttalt seg eller ikke',
//         path: ['harUttaltSeg'],
//     });

const opprettSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Ja),
    fritekst: fritekstSchema,
});

export const getOpprettValues = (): ForhåndsvarselFormData => {
    return {
        skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja,
        fritekst: '',
    };
};

const unntakSchema = z
    .object({
        skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Nei),
        begrunnelseForUnntak: zBegrunnelseForUnntakEnum.optional(),
        beskrivelse: z.string().min(1, 'Du må fylle inn en verdi').max(2000),
    })
    .refine(data => data.begrunnelseForUnntak !== undefined, {
        message: 'Du må velge en begrunnelse for unntak fra forhåndsvarsel',
        path: ['begrunnelseForUnntak'],
    });

export const getUnntakValues = (
    forhåndsvarselUnntak: ForhåndsvarselUnntakDto
): ForhåndsvarselFormData => {
    return {
        skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Nei,
        begrunnelseForUnntak: forhåndsvarselUnntak.begrunnelseForUnntak,
        beskrivelse: forhåndsvarselUnntak.beskrivelse,
    };
};

const ikkeValgtSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.IkkeValgt),
});

export const getDefaultValues = (
    varselErSendt: boolean,
    forhåndsvarselInfo: ForhåndsvarselDto | undefined
): ForhåndsvarselFormData => {
    if (varselErSendt) {
        return getOpprettValues();
    }

    const forhåndsvarselUnntak = forhåndsvarselInfo?.forhåndsvarselUnntak;
    if (forhåndsvarselUnntak) {
        return getUnntakValues(forhåndsvarselUnntak);
    }

    return {
        skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.IkkeValgt,
    };
};

const forhåndsvarselSchemaBase = z.discriminatedUnion('skalSendesForhåndsvarsel', [
    opprettSchema,
    unntakSchema,
    ikkeValgtSchema,
]);

export const forhåndsvarselSchema = forhåndsvarselSchemaBase.refine(
    data => data.skalSendesForhåndsvarsel !== SkalSendesForhåndsvarsel.IkkeValgt,
    {
        message: 'Du må velge om forhåndsvarselet skal sendes eller ikke',
        path: ['skalSendesForhåndsvarsel'],
    }
);

export type ForhåndsvarselFormData =
    | z.infer<typeof opprettSchema>
    | z.infer<typeof unntakSchema>
    | { skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.IkkeValgt };

export type UttalelseMedFristFormData =
    | z.infer<typeof harIkkeUttaltSegSchema>
    | z.infer<typeof harUttaltSegSchema>
    | z.infer<typeof utsettFristSchema>
    | { harUttaltSeg: HarUttaltSeg.IkkeValgt };
