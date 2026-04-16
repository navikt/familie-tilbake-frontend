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
    opprinnelig: RotElement
): RotElementWritable => {
    if (oppdatert.type !== 'påkrevd_begrunnelse') {
        return oppdatert satisfies RotElementWritable;
    }
    if (opprinnelig.type !== 'påkrevd_begrunnelse') {
        throw new Error(
            `Forventet 'påkrevd_begrunnelse' i opprinneligdata, men fikk '${opprinnelig.type}'`
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
            underavsnitt: formData.hovedavsnitt.underavsnitt.map((el, i) =>
                tilRotElementWritable(el, hovedavsnitt.underavsnitt[i])
            ),
        },
        avsnitt: formData.avsnitt.map((formAvsnitt, i) => ({
            tittel: formAvsnitt.tittel,
            id: formAvsnitt.id,
            underavsnitt: formAvsnitt.underavsnitt.map((el, j) =>
                tilRotElementWritable(el, avsnitt[i].underavsnitt[j])
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
