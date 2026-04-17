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

const validerUnderavsnitt = z.array(z.any()).superRefine((arr, ctx) => {
    if (samletRentekstLengde(arr) < MINIMUM_TEKST_LENGDE) {
        ctx.addIssue({ code: 'custom', message: FEILMELDING });
    }
    for (const [j, element] of arr.entries()) {
        if (
            element.type === 'påkrevd_begrunnelse' &&
            samletRentekstLengde(element.underavsnitt ?? []) < MINIMUM_TEKST_LENGDE
        ) {
            ctx.addIssue({ code: 'custom', message: FEILMELDING, path: [j, 'underavsnitt'] });
        }
    }
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
