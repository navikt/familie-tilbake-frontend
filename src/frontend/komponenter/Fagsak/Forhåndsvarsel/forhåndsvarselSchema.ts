import type { ForhåndsvarselDto, ForhåndsvarselUnntakDto } from '../../../generated';

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
    forhåndsvarselInfo: ForhåndsvarselDto | undefined
): UttalelseMedFristFormData => {
    const utsettUttalelseFrist = forhåndsvarselInfo?.utsettUttalelseFrist;
    if (utsettUttalelseFrist?.length) {
        return {
            harUttaltSeg: HarUttaltSeg.UtsettFrist,
            utsettUttalelseFrist: {
                nyFrist:
                    forhåndsvarselInfo?.utsettUttalelseFrist[
                        forhåndsvarselInfo.utsettUttalelseFrist.length - 1
                    ]?.nyFrist ?? '',
                begrunnelse:
                    forhåndsvarselInfo?.utsettUttalelseFrist[
                        forhåndsvarselInfo.utsettUttalelseFrist.length - 1
                    ]?.begrunnelse ?? '',
            },
        };
    }
    const brukerUttalelse = forhåndsvarselInfo?.brukeruttalelse;
    const uttalelsesdetaljer = brukerUttalelse?.uttalelsesdetaljer
        ? [brukerUttalelse.uttalelsesdetaljer[brukerUttalelse.uttalelsesdetaljer.length - 1]]
        : [
              {
                  hvorBrukerenUttalteSeg: '',
                  uttalelseBeskrivelse: '',
                  uttalelsesdato: '',
              },
          ];

    if (brukerUttalelse?.harBrukerUttaltSeg) {
        switch (brukerUttalelse?.harBrukerUttaltSeg) {
            case 'JA':
                return {
                    harUttaltSeg: HarUttaltSeg.Ja,
                    uttalelsesDetaljer: uttalelsesdetaljer,
                };
            case 'NEI':
                return {
                    harUttaltSeg: HarUttaltSeg.Nei,
                    kommentar: forhåndsvarselInfo?.brukeruttalelse?.kommentar ?? '',
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

export const unntakSchema = z
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

export const forhåndsvarselSchema = z
    .discriminatedUnion('skalSendesForhåndsvarsel', [opprettSchema, unntakSchema, ikkeValgtSchema])
    .refine(data => data.skalSendesForhåndsvarsel !== SkalSendesForhåndsvarsel.IkkeValgt, {
        message: 'Du må velge om forhåndsvarselet skal sendes eller ikke',
        path: ['skalSendesForhåndsvarsel'],
    });

export type ForhåndsvarselFormData = z.infer<typeof forhåndsvarselSchema>;
export type UttalelseMedFristFormData = z.infer<typeof uttalelseMedFristSchema>;
export type UnntakFormData = z.infer<typeof unntakSchema>;
