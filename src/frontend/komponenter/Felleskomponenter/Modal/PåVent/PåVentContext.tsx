import { useState } from 'react';

import { useHttp } from '@navikt/familie-http';
import { useSkjema, useFelt, type FeltState, feil, ok } from '@navikt/familie-skjema';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { IBehandlingsstegstilstand, Venteårsak } from '../../../../typer/behandling';
import { isEmpty, validerGyldigDato } from '../../../../utils';
import { IRestSettPåVent } from '../../../../typer/api';
import { dateTilIsoDatoString, isoStringTilDate } from '../../../../utils/dato';

export const usePåVentBehandling = (
    lukkModal: (suksess: boolean) => void,
    ventegrunn?: IBehandlingsstegstilstand | undefined
) => {
    const [feilmelding, settFeilmelding] = useState<string>();
    const { request } = useHttp();

    const { onSubmit, skjema, nullstillSkjema, kanSendeSkjema } = useSkjema<
        {
            tidsfrist: Date | undefined;
            årsak: Venteårsak | '';
        },
        string
    >({
        felter: {
            tidsfrist: useFelt<Date | undefined>({
                verdi: undefined,
                valideringsfunksjon: (felt: FeltState<Date | undefined>) => {
                    return isEmpty(felt.verdi)
                        ? feil(felt, 'Du må velge en tidsfrist')
                        : validerGyldigDato(felt);
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

    const [forrigeVentegrunn, settForrigeVentegrunn] = useState<
        IBehandlingsstegstilstand | undefined
    >();

    if (ventegrunn !== forrigeVentegrunn) {
        settForrigeVentegrunn(ventegrunn);
        skjema.felter.tidsfrist.validerOgSettFelt(
            ventegrunn?.tidsfrist ? isoStringTilDate(ventegrunn.tidsfrist) : undefined
        );
    }

    const tilbakestillFelterTilDefault = () => {
        nullstillSkjema();
        skjema.felter.tidsfrist.validerOgSettFelt(
            ventegrunn?.tidsfrist ? isoStringTilDate(ventegrunn.tidsfrist) : undefined
        );
    };

    const onBekreft = (behandlingId: string) => {
        if (kanSendeSkjema() && skjema.felter.årsak.verdi && skjema.felter.tidsfrist.verdi) {
            onSubmit<IRestSettPåVent>(
                {
                    method: 'PUT',
                    data: {
                        venteårsak: skjema.felter.årsak.verdi,
                        tidsfrist: dateTilIsoDatoString(skjema.felter.tidsfrist.verdi),
                    },
                    url: `/familie-tilbake/api/behandling/${behandlingId}/vent/v1`,
                },
                () => {
                    if (ventegrunn) {
                        ventegrunn.tidsfrist = dateTilIsoDatoString(skjema.felter.tidsfrist.verdi);
                        ventegrunn.venteårsak = skjema.felter.årsak.verdi as Venteårsak;
                    }
                    lukkModal(true);
                },
                (response: Ressurs<string>) => {
                    if (
                        response.status === RessursStatus.FEILET ||
                        response.status === RessursStatus.FUNKSJONELL_FEIL
                    ) {
                        settFeilmelding(response.frontendFeilmelding);
                    }
                }
            );
        }
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
        tilbakestillFelterTilDefault,
    };
};
