import { useHttp } from '@navikt/familie-http';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';
import { useState } from 'react';

export const useAngreSammenslåingPerioder = (behandlingId: string) => {
    const { request } = useHttp();
    const [feilmelding, settFeilmelding] = useState<string>();

    const angreSammenslåingAvPerioder = async () => {
        const response: Ressurs<string> = await request<void, string>({
            method: 'POST',
            url: `/familie-tilbake/api/perioder/angre-sammenslaing/${behandlingId}`,
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

    return { angreSammenslåingAvPerioder, feilmelding };
};
