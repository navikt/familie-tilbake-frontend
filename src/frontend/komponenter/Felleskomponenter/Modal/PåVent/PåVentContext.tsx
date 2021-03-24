import { useState } from 'react';

import { useHttp } from '@navikt/familie-http';
import { useSkjema, useFelt, FeltState, feil, ok } from '@navikt/familie-skjema';
import { Ressurs, RessursStatus } from '@navikt/familie-typer';

import { IBehandlingsstegstilstand, Venteårsak } from '../../../../typer/behandling';

export const usePåVentBehandling = (
    lukkModal: (suksess: boolean) => void,
    ventegrunn?: IBehandlingsstegstilstand | undefined
) => {
    const [feilmelding, settFeilmelding] = useState<string>();
    const { request } = useHttp();

    const { onSubmit, skjema, nullstillSkjema } = useSkjema<
        {
            tidsfrist: string | '';
            årsak: Venteårsak | '';
        },
        string
    >({
        felter: {
            tidsfrist: useFelt<string | ''>({
                verdi: ventegrunn?.tidsfrist ? ventegrunn.tidsfrist : '',
                valideringsfunksjon: (felt: FeltState<string | ''>) => {
                    return felt.verdi !== '' ? ok(felt) : feil(felt, 'Du må velge en tidsfrist');
                },
            }),
            årsak: useFelt<Venteårsak | ''>({
                verdi: ventegrunn?.venteårsak ? ventegrunn.venteårsak : '',
                valideringsfunksjon: (felt: FeltState<Venteårsak | ''>) =>
                    felt.verdi !== '' ? ok(felt) : feil(felt, 'Du må velge årsak'),
            }),
        },
        skjemanavn: 'påventbehandling',
    });

    const onBekreft = (behandlingId: string) => {
        onSubmit(
            {
                method: 'PUT',
                data: {
                    behandlingId: behandlingId,
                    venteårsak: skjema.felter.årsak.verdi,
                    tidsfrist: skjema.felter.tidsfrist.verdi,
                },
                url: `/familie-tilbake/api/behandling/${behandlingId}/vent/v1`,
            },
            (_ressurs: Ressurs<string>) => {
                if (ventegrunn) {
                    ventegrunn.tidsfrist = skjema.felter.tidsfrist.verdi;
                    // @ts-ignore
                    ventegrunn.venteårsak = skjema.felter.årsak.verdi;
                }
                lukkModal(true);
            }
        );
    };

    const onOkTaAvVent = (behandlingId: string) => {
        request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/behandling/${behandlingId}/gjenoppta/v1`,
        }).then((response: Ressurs<string>) => {
            if (response.status === RessursStatus.SUKSESS) {
                lukkModal(true);
            } else {
                console.log('Gjennopta behandling feilet!');
                if (
                    response.status === RessursStatus.FEILET ||
                    response.status === RessursStatus.FUNKSJONELL_FEIL
                ) {
                    settFeilmelding(response.frontendFeilmelding);
                }
            }
        });
    };

    return {
        skjema,
        feilmelding,
        nullstillSkjema,
        onBekreft,
        onOkTaAvVent,
    };
};
