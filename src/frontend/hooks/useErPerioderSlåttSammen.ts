import { useHttp } from '@navikt/familie-http';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';
import { useState } from 'react';

export const useErPerioderSlåttSammen = (behandlingId: string) => {
    const { request } = useHttp();
    const [feilmelding, settFeilmelding] = useState<string>();
    const [erPerioderSlåttSammen, settErPerioderSlåttSammen] = useState<boolean>(false);

    const hentErPerioderSlåttSammen = async () => {
        const response: Ressurs<boolean> = await request<void, boolean>({
            method: 'GET',
            url: `/familie-tilbake/api/perioder/erPerioderSlaattSammen/${behandlingId}`,
        });

        if (response.status === RessursStatus.SUKSESS) {
            settErPerioderSlåttSammen(response.data);
        } else if (
            response.status === RessursStatus.FEILET ||
            response.status === RessursStatus.FUNKSJONELL_FEIL ||
            response.status === RessursStatus.IKKE_TILGANG
        ) {
            settFeilmelding(response.frontendFeilmelding);
        }
    };

    return { erPerioderSlåttSammen, hentErPerioderSlåttSammen, feilmelding };
};
