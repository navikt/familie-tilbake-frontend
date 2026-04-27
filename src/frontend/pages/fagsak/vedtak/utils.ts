import type { VedtaksbrevFormData } from './schema';
import type {
    RotElement,
    RotElementUpdateItem,
    RotElementWritable,
    VedtaksbrevData,
    VedtaksbrevDataWritable,
} from '~/generated-new';

const tilRotElementWritable = (
    oppdatert: RotElementUpdateItem,
    opprinneligeElementer: RotElement[]
): RotElementWritable => {
    if (oppdatert.type !== 'påkrevd_begrunnelse') {
        return oppdatert satisfies RotElementWritable;
    }
    const opprinnelig = opprinneligeElementer.find(
        e => e.type === 'påkrevd_begrunnelse' && e.begrunnelseType === oppdatert.begrunnelseType
    );
    if (!opprinnelig || opprinnelig.type !== 'påkrevd_begrunnelse') {
        throw new Error(
            `Fant ikke matchende 'påkrevd_begrunnelse' med begrunnelseType '${oppdatert.begrunnelseType}' i opprinneligdata`
        );
    }
    return { ...oppdatert, tittel: opprinnelig.tittel } satisfies RotElementWritable;
};

export const tilVedtaksbrevDataWritable = (
    vedtaksbrevData: VedtaksbrevData,
    formData: VedtaksbrevFormData
): VedtaksbrevDataWritable => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sistOppdatert: _, hovedavsnitt, avsnitt, ...statiskeData } = vedtaksbrevData;
    return {
        ...statiskeData,
        hovedavsnitt: {
            tittel: formData.hovedavsnitt.tittel,
            hjemler: vedtaksbrevData.hovedavsnitt.hjemler,
            underavsnitt: formData.hovedavsnitt.underavsnitt.map(el =>
                tilRotElementWritable(el, hovedavsnitt.underavsnitt)
            ),
        },
        avsnitt: formData.avsnitt.map((formAvsnitt, i) => ({
            tittel: formAvsnitt.tittel,
            id: formAvsnitt.id,
            underavsnitt: formAvsnitt.underavsnitt.map(el =>
                tilRotElementWritable(el, avsnitt[i].underavsnitt)
            ),
        })),
    };
};

export const elementArrayTilTekst = (elementer: RotElement[]): string => {
    return elementer
        .filter(e => e.type === 'rentekst')
        .map(e => (e.type === 'rentekst' ? e.tekst : undefined))
        .join('\n\n');
};

export const tekstTilElementArray = (tekst: string): RotElement[] => {
    return tekst
        .split(/\n\n+/)
        .filter(t => t.length > 0)
        .map(t => ({ type: 'rentekst' as const, tekst: t }));
};
