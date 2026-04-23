import type { VedtaksbrevRedigerbareDataUpdate } from '~/generated-new';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export type VedtaksbrevFormData = VedtaksbrevRedigerbareDataUpdate;

const MINIMUM_TEKST_LENGDE = 3;
const FEILMELDING = 'Du må fylle inn minst 3 tegn';

const samletRentekstLengde = (elementer: { type: string; tekst?: string }[]): number =>
    elementer
        .filter(el => el.type === 'rentekst')
        .reduce((acc, el) => acc + (el.tekst?.length ?? 0), 0);

const harForLiteRentekst = (elementer: { type: string; tekst?: string }[]): boolean =>
    samletRentekstLengde(elementer) < MINIMUM_TEKST_LENGDE;

const validerUnderavsnitt = z.array(z.any()).superRefine((arr, ctx) => {
    if (harForLiteRentekst(arr)) {
        ctx.addIssue({ code: 'custom', message: FEILMELDING });
    }

    arr.forEach((element, index) => {
        if (element.type !== 'påkrevd_begrunnelse') return;
        if (harForLiteRentekst(element.underavsnitt ?? [])) {
            ctx.addIssue({ code: 'custom', message: FEILMELDING, path: [index, 'underavsnitt'] });
        }
    });
});

const vedtaksbrevSchema = z.object({
    hovedavsnitt: z.object({
        tittel: z.string(),
        underavsnitt: validerUnderavsnitt,
    }),
    avsnitt: z.array(
        z.object({
            tittel: z.string(),
            id: z.string(),
            underavsnitt: validerUnderavsnitt,
        })
    ),
});

export const vedtaksbrevResolver = zodResolver(vedtaksbrevSchema);
