import type { ForhåndsvarselInfo } from './useForhåndsvarselQueries';

import { z } from 'zod';

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
    .min(3, 'Du må legge inn minst tre tegn')
    .max(4000, 'Maksimalt 4000 tegn tillatt');

const uttalelsesDetaljerSchema = z.object({
    uttalelsesdato: z.iso.date({ error: 'Du må legge inn en gyldig dato' }),
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

export const uttalelseMedFristSchema = z
    .discriminatedUnion('harUttaltSeg', [
        harUttaltSegSchema,
        harIkkeUttaltSegSchema,
        utsettFristSchema,
        ikkeValgtUttalelseSchema,
    ])
    .refine(data => data.harUttaltSeg !== HarUttaltSeg.IkkeValgt, {
        message: 'Du må velge om brukeren har uttalt seg eller om fristen skal utsettes',
        path: ['harUttaltSeg'],
    });

export const getUttalelseValues = (
    forhåndsvarselInfo: ForhåndsvarselInfo
): UttalelseMedFristFormData => {
    const utsettUttalelseFrist = forhåndsvarselInfo?.utsettUttalelseFrist;
    if (utsettUttalelseFrist.length > 0) {
        return {
            harUttaltSeg: HarUttaltSeg.UtsettFrist,
            utsettUttalelseFrist: {
                nyFrist:
                    forhåndsvarselInfo.utsettUttalelseFrist[
                        forhåndsvarselInfo.utsettUttalelseFrist.length - 1
                    ]?.nyFrist ?? '',
                begrunnelse:
                    forhåndsvarselInfo.utsettUttalelseFrist[
                        forhåndsvarselInfo.utsettUttalelseFrist.length - 1
                    ]?.begrunnelse ?? '',
            },
        };
    }
    const brukerUttalelse = forhåndsvarselInfo?.brukeruttalelse;
    const uttalelsesdetaljer = brukerUttalelse?.uttalelsesdetaljer
        ? [brukerUttalelse.uttalelsesdetaljer[brukerUttalelse.uttalelsesdetaljer.length - 1]]
        : [];

    if (brukerUttalelse?.harBrukerUttaltSeg) {
        switch (brukerUttalelse?.harBrukerUttaltSeg) {
            case 'JA':
                return {
                    harUttaltSeg: HarUttaltSeg.Ja,
                    uttalelsesDetaljer: uttalelsesdetaljer ?? [
                        {
                            hvorBrukerenUttalteSeg: '',
                            uttalelseBeskrivelse: '',
                            uttalelsesdato: '',
                        },
                    ],
                };
            case 'NEI':
                return {
                    harUttaltSeg: HarUttaltSeg.Nei,
                    kommentar: forhåndsvarselInfo.brukeruttalelse?.kommentar ?? '',
                };
        }
    }

    return {
        harUttaltSeg: HarUttaltSeg.IkkeValgt,
    };
};

export const uttalelseSchema = z
    .discriminatedUnion('harUttaltSeg', [
        harIkkeUttaltSegSchema,
        harUttaltSegSchema,
        ikkeValgtUttalelseSchema,
    ])
    .refine(data => data.harUttaltSeg !== HarUttaltSeg.IkkeValgt, {
        message: 'Du må velge om brukeren har uttalt seg eller ikke',
        path: ['harUttaltSeg'],
    });

export const opprettSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Ja),
    fritekst: fritekstSchema,
});

export const getOpprettValues = (): ForhåndsvarselFormData => {
    return {
        skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja,
        fritekst: '',
    };
};

const unntakSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Nei),
    // begrunnelseForUnntak: z.enum(
    //     ['IkkePraktiskMulig', 'UrimeligRessurskrevende', 'ÅpenbartUnødvendig'],
    //     { error: 'Du må velge en begrunnelse for unntak' }
    // ),
    // beskrivelse: z.string().min(3, 'Du må legge inn minst tre tegn').max(2000, 'Maksimalt 2000 tegn tillatt'),
});

const getUnntakValues = (): ForhåndsvarselFormData => {
    // const brukerUttalelse = forhåndsvarselInfo?.brukeruttalelse;
    // const harBrukerUttaltSegVerdi = brukerUttalelse?.harBrukerUttaltSeg;
    // const utsettelsesdetaljer = brukerUttalelse?.uttalelsesdetaljer
    //     ? [brukerUttalelse.uttalelsesdetaljer[brukerUttalelse.uttalelsesdetaljer.length - 1]]
    //     : [];
    // if (harBrukerUttaltSegVerdi) {
    //     const brukerUttalelse = mapHarBrukerUttaltSegFraApiDto(harBrukerUttaltSegVerdi);
    //     if (brukerUttalelse === HarBrukerUttaltSeg.Ja) {
    //         return {
    //             skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Nei,
    //             harBrukerUttaltSeg: {
    //                 harBrukerUttaltSeg: HarBrukerUttaltSeg.Ja,
    //                 uttalelsesDetaljer: utsettelsesdetaljer,
    //             },
    //         };
    //     } else if (brukerUttalelse === HarBrukerUttaltSeg.Nei) {
    //         return {
    //             skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Nei,
    //             harBrukerUttaltSeg: {
    //                 harBrukerUttaltSeg: HarBrukerUttaltSeg.Nei,
    //                 kommentar: forhåndsvarselInfo.brukeruttalelse?.kommentar ?? '',
    //             },
    //         };
    //     }
    // }

    return {
        skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Nei,
    };
};

const ikkeValgtSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.IkkeValgt),
});

const getForhåndsvarselStatus = (varselErSendt: boolean): SkalSendesForhåndsvarsel => {
    if (varselErSendt) {
        return SkalSendesForhåndsvarsel.Ja;
    }
    /* if (unntak !== undefined) {
            return SkalSendesForhåndsvarsel.Nei;
        } */
    return SkalSendesForhåndsvarsel.IkkeValgt;
};

export const getDefaultValues = (varselErSendt: boolean): ForhåndsvarselFormData => {
    switch (getForhåndsvarselStatus(varselErSendt)) {
        case SkalSendesForhåndsvarsel.Ja:
            return getOpprettValues();
        case SkalSendesForhåndsvarsel.Nei:
            return getUnntakValues();
        default:
            return {
                skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.IkkeValgt,
            };
    }
};

export const forhåndsvarselSchema = z
    .discriminatedUnion('skalSendesForhåndsvarsel', [opprettSchema, unntakSchema, ikkeValgtSchema])
    .refine(data => data.skalSendesForhåndsvarsel !== SkalSendesForhåndsvarsel.IkkeValgt, {
        message: 'Du må velge om forhåndsvarselet skal sendes eller ikke',
        path: ['skalSendesForhåndsvarsel'],
    });

export type ForhåndsvarselFormData = z.infer<typeof forhåndsvarselSchema>;
export type UttalelseMedFristFormData = z.infer<typeof uttalelseMedFristSchema>;
