import type { VedtaksbrevFormData } from './schema';
import type { TagProps } from '@navikt/ds-react';
import type {
    RotElementUpdateItem,
    RotElementWritable,
    VedtaksbrevData,
    VedtaksbrevDataWritable,
    VedtaksbrevRedigerbareDataUpdate,
    Vedtaksresultat,
} from '~/generated-new';

type RentekstElement = { type: 'rentekst'; tekst: string };

export const vedtaksresultatFarger: Record<Vedtaksresultat, TagProps['data-color']> = {
    DelvisTilbakebetaling: 'meta-purple',
    IngenTilbakebetaling: 'brand-beige',
    FullTilbakebetaling: 'meta-lime',
};

export const elementArrayTilTekst = (
    elementer: readonly { type: string; tekst?: string }[]
): string =>
    elementer
        .filter((e): e is RentekstElement => e.type === 'rentekst')
        .map(e => e.tekst)
        .join('\n\n');

export const tekstTilElementArray = (tekst: string): RentekstElement[] =>
    tekst
        .split(/\n\n+/)
        .filter(t => t.length > 0)
        .map(t => ({ type: 'rentekst', tekst: t }));

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
                tekst: elementArrayTilTekst(el.underavsnitt),
            })),
    })),
});

const finnFormPåkrevd = (
    formAvsnitt: VedtaksbrevFormData['avsnitt'][number],
    begrunnelseType: string
): VedtaksbrevFormData['avsnitt'][number]['påkrevdeBegrunnelser'][number] => {
    const formPåkrevd = formAvsnitt.påkrevdeBegrunnelser.find(
        p => p.begrunnelseType === begrunnelseType
    );
    if (!formPåkrevd) {
        throw new Error(
            `Fant ikke matchende 'påkrevd_begrunnelse' med begrunnelseType '${begrunnelseType}' i form-data`
        );
    }
    return formPåkrevd;
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
            tittel: hovedavsnitt.tittel,
            hjemler: hovedavsnitt.hjemler,
            underavsnitt: tekstTilElementArray(formData.hovedavsnitt.tekst),
        },
        avsnitt: formData.avsnitt.map((formAvsnitt, i) => {
            const opprinnelig = avsnitt[i];
            const påkrevdeWritable: RotElementWritable[] = opprinnelig.underavsnitt
                .filter(el => el.type === 'påkrevd_begrunnelse')
                .map(opprinneligPåkrevd => ({
                    tittel: opprinneligPåkrevd.tittel,
                    ...mapTilRotElementUpdateItem(opprinneligPåkrevd, formAvsnitt),
                }));
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
        const påkrevdeUpdate: RotElementUpdateItem[] = opprinnelig.underavsnitt
            .filter(el => el.type === 'påkrevd_begrunnelse')
            .map(opprinneligPåkrevd => mapTilRotElementUpdateItem(opprinneligPåkrevd, formAvsnitt));
        return {
            tittel: opprinnelig.tittel,
            id: formAvsnitt.id,
            underavsnitt: [...tekstTilElementArray(formAvsnitt.tekst), ...påkrevdeUpdate],
        };
    }),
});

const mapTilRotElementUpdateItem = (
    opprinnelig: VedtaksbrevData['avsnitt'][number]['underavsnitt'][number] & {
        type: 'påkrevd_begrunnelse';
    },
    formAvsnitt: VedtaksbrevFormData['avsnitt'][number]
): RotElementUpdateItem => ({
    type: opprinnelig.type,
    begrunnelseType: opprinnelig.begrunnelseType,
    underavsnitt: tekstTilElementArray(
        finnFormPåkrevd(formAvsnitt, opprinnelig.begrunnelseType).tekst
    ),
});
