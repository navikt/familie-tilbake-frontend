import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const MINIMUM_TEKST_LENGDE = 3;
const FEILMELDING = 'Du må fylle inn minst 3 tegn';
const tekstFelt = z.string().min(MINIMUM_TEKST_LENGDE, FEILMELDING);

const påkrevdBegrunnelseSchema = z.object({
    begrunnelseType: z.string(),
    tekst: tekstFelt,
});

const avsnittSchema = z.object({
    id: z.string(),
    tekst: tekstFelt,
    påkrevdeBegrunnelser: z.array(påkrevdBegrunnelseSchema),
});

const vedtaksbrevSchema = z.object({
    hovedavsnitt: z.object({
        tekst: tekstFelt,
    }),
    avsnitt: z.array(avsnittSchema),
});

export type VedtaksbrevFormData = z.infer<typeof vedtaksbrevSchema>;

export const vedtaksbrevResolver = zodResolver(vedtaksbrevSchema);
