import { useHttp } from '@navikt/familie-http';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';
import { useState } from 'react';

export const useSammenslåPerioder = (behandlingId: string) => {
    const { request } = useHttp();
    const [feilmelding, settFeilmelding] = useState<string>();

    const sammenslåPerioder = async () => {
        const response: Ressurs<string> = await request<void, string>({
            method: 'POST',
            url: `/familie-tilbake/api/perioder/sammensla/${behandlingId}`,
        });

        if (response.status === RessursStatus.SUKSESS) {
            return response.data;
        } else if (
            response.status === RessursStatus.FEILET ||
            response.status === RessursStatus.FUNKSJONELL_FEIL ||
            response.status === RessursStatus.IKKE_TILGANG
        ) {
            settFeilmelding(response.frontendFeilmelding);
            return false;
        }
    };

    return { sammenslåPerioder, feilmelding };
};
