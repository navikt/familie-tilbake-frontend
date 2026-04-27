import type { VedtaksbrevFormData } from './schema';
import type {
    PakrevdBegrunnelseUpdateItem,
    RotElement,
    RotElementUpdateItem,
    RotElementWritable,
    VedtaksbrevData,
    VedtaksbrevDataWritable,
    VedtaksbrevRedigerbareDataUpdate,
} from '~/generated-new';

export const elementArrayTilTekst = (elementer: RotElement[]): string =>
    elementer
        .filter(e => e.type === 'rentekst')
        .map(e => (e.type === 'rentekst' ? e.tekst : ''))
        .join('\n\n');

export const tekstTilElementArray = (tekst: string): RotElement[] =>
    tekst
        .split(/\n\n+/)
        .filter(t => t.length > 0)
        .map(t => ({ type: 'rentekst' as const, tekst: t }));

export const tilFormData = (vedtaksbrevData: VedtaksbrevData): VedtaksbrevFormData => ({
    hovedavsnitt: {
        tekst: elementArrayTilTekst(vedtaksbrevData.hovedavsnitt.underavsnitt),
    },
    avsnitt: vedtaksbrevData.avsnitt.map(avsnitt => ({
        id: avsnitt.id,
        tekst: elementArrayTilTekst(avsnitt.underavsnitt),
        påkrevdeBegrunnelser: avsnitt.underavsnitt
            .filter(el => el.type === 'påkrevd_begrunnelse')
            .map(el => ({
                begrunnelseType: el.begrunnelseType,
                tekst: el.underavsnitt
                    .filter(u => u.type === 'rentekst')
                    .map(u => u.tekst)
                    .join('\n\n'),
            })),
    })),
});

export const tilVedtaksbrevDataWritable = (
    vedtaksbrevData: VedtaksbrevData,
    formData: VedtaksbrevFormData
): VedtaksbrevDataWritable => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sistOppdatert: _, hovedavsnitt, avsnitt, ...statiskeData } = vedtaksbrevData;
    return {
        ...statiskeData,
        hovedavsnitt: {
            tittel: hovedavsnitt.tittel,
            hjemler: hovedavsnitt.hjemler,
            underavsnitt: tekstTilElementArray(formData.hovedavsnitt.tekst),
        },
        avsnitt: formData.avsnitt.map((formAvsnitt, i) => {
            const opprinnelig = avsnitt[i];
            const påkrevdeFraDto = opprinnelig.underavsnitt.filter(
                el => el.type === 'påkrevd_begrunnelse'
            );
            const påkrevdeWritable: RotElementWritable[] = påkrevdeFraDto.map(
                opprinneligPåkrevd => {
                    const formPåkrevd = formAvsnitt.påkrevdeBegrunnelser.find(
                        p => p.begrunnelseType === opprinneligPåkrevd.begrunnelseType
                    );
                    if (!formPåkrevd) {
                        throw new Error(
                            `Fant ikke matchende 'påkrevd_begrunnelse' med begrunnelseType '${opprinneligPåkrevd.begrunnelseType}' i form-data`
                        );
                    }
                    return {
                        type: 'påkrevd_begrunnelse',
                        tittel: opprinneligPåkrevd.tittel,
                        begrunnelseType: opprinneligPåkrevd.begrunnelseType,
                        underavsnitt: formPåkrevd.tekst
                            .split(/\n\n+/)
                            .filter(t => t.length > 0)
                            .map(t => ({ type: 'rentekst' as const, tekst: t })),
                    };
                }
            );
            return {
                tittel: opprinnelig.tittel,
                id: formAvsnitt.id,
                underavsnitt: [...tekstTilElementArray(formAvsnitt.tekst), ...påkrevdeWritable],
            };
        }),
    };
};

export const tilVedtaksbrevRedigerbareDataUpdate = (
    vedtaksbrevData: VedtaksbrevData,
    formData: VedtaksbrevFormData
): VedtaksbrevRedigerbareDataUpdate => ({
    hovedavsnitt: {
        tittel: vedtaksbrevData.hovedavsnitt.tittel,
        underavsnitt: tekstTilElementArray(formData.hovedavsnitt.tekst),
    },
    avsnitt: formData.avsnitt.map((formAvsnitt, i) => {
        const opprinnelig = vedtaksbrevData.avsnitt[i];
        const påkrevdeFraDto = opprinnelig.underavsnitt.filter(
            el => el.type === 'påkrevd_begrunnelse'
        );
        const påkrevdeUpdate: RotElementUpdateItem[] = påkrevdeFraDto.map(opprinneligPåkrevd => {
            const formPåkrevd = formAvsnitt.påkrevdeBegrunnelser.find(
                p => p.begrunnelseType === opprinneligPåkrevd.begrunnelseType
            );
            if (!formPåkrevd) {
                throw new Error(
                    `Fant ikke matchende 'påkrevd_begrunnelse' med begrunnelseType '${opprinneligPåkrevd.begrunnelseType}' i form-data`
                );
            }
            const update = {
                begrunnelseType: opprinneligPåkrevd.begrunnelseType,
                underavsnitt: formPåkrevd.tekst
                    .split(/\n\n+/)
                    .filter(t => t.length > 0)
                    .map(t => ({ type: 'rentekst' as const, tekst: t })),
            } satisfies PakrevdBegrunnelseUpdateItem;
            return { type: 'påkrevd_begrunnelse', ...update };
        });
        return {
            tittel: opprinnelig.tittel,
            id: formAvsnitt.id,
            underavsnitt: [...tekstTilElementArray(formAvsnitt.tekst), ...påkrevdeUpdate],
        };
    }),
});
