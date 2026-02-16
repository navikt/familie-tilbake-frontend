import type { BehandlingsstegsinfoDto, VenteårsakEnum } from '../../../../generated';
import type { Skjema, FeltState } from '../../../../hooks/skjema';
import type { RestSettPåVent } from '../../../../typer/api';
import type { Ressurs } from '../../../../typer/ressurs';

import { useState } from 'react';

import { useHttp } from '../../../../api/http/HttpProvider';
import { useBehandlingState } from '../../../../context/BehandlingStateContext';
import { useSkjema, useFelt, feil, ok } from '../../../../hooks/skjema';
import { RessursStatus } from '../../../../typer/ressurs';
import { isEmpty, validerGyldigDato } from '../../../../utils';
import { dateTilIsoDatoString, isoStringTilDate } from '../../../../utils/dato';

type PåVentBehandlingHook = {
    skjema: Skjema<
        {
            tidsfrist: Date | undefined;
            årsak: VenteårsakEnum | '';
        },
        string
    >;
    feilmelding?: string;
    nullstillSkjema: () => void;
    onBekreft: (behandlingId: string) => void;
    onOkTaAvVent: (behandlingId: string) => void;
    tilbakestillFelterTilDefault: () => void;
};

export const usePåVentBehandling = (
    lukkModal: () => void,
    ventegrunn?: BehandlingsstegsinfoDto | undefined
): PåVentBehandlingHook => {
    const [feilmelding, settFeilmelding] = useState<string>();
    const { request } = useHttp();
    const { nullstillIkkePersisterteKomponenter } = useBehandlingState();

    const { onSubmit, skjema, nullstillSkjema, kanSendeSkjema } = useSkjema<
        {
            tidsfrist: Date | undefined;
            årsak: VenteårsakEnum | '';
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
            årsak: useFelt<VenteårsakEnum | ''>({
                verdi: ventegrunn?.venteårsak ? ventegrunn.venteårsak : '',
                valideringsfunksjon: (felt: FeltState<VenteårsakEnum | ''>) =>
                    felt.verdi !== '' ? ok(felt) : feil(felt, 'Du må velge årsak'),
            }),
        },
        skjemanavn: 'påventbehandling',
    });

    const [forrigeVentegrunn, settForrigeVentegrunn] = useState<
        BehandlingsstegsinfoDto | undefined
    >();

    if (ventegrunn !== forrigeVentegrunn) {
        settForrigeVentegrunn(ventegrunn);
        skjema.felter.tidsfrist.validerOgSettFelt(
            ventegrunn?.tidsfrist ? isoStringTilDate(ventegrunn.tidsfrist) : undefined
        );
    }

    const tilbakestillFelterTilDefault = (): void => {
        nullstillSkjema();
        skjema.felter.tidsfrist.validerOgSettFelt(
            ventegrunn?.tidsfrist ? isoStringTilDate(ventegrunn.tidsfrist) : undefined
        );
    };

    const onBekreft = (behandlingId: string): void => {
        if (kanSendeSkjema() && skjema.felter.årsak.verdi && skjema.felter.tidsfrist.verdi) {
            nullstillIkkePersisterteKomponenter();
            onSubmit<RestSettPåVent>(
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
                        ventegrunn.venteårsak = skjema.felter.årsak.verdi as VenteårsakEnum;
                    }
                    lukkModal();
                },
                (response: Ressurs<string>) => {
                    if (
                        response.status === RessursStatus.Feilet ||
                        response.status === RessursStatus.FunksjonellFeil
                    ) {
                        settFeilmelding(response.frontendFeilmelding);
                    }
                }
            );
        }
    };

    const onOkTaAvVent = (behandlingId: string): void => {
        nullstillIkkePersisterteKomponenter();
        request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/behandling/${behandlingId}/gjenoppta/v1`,
        }).then((response: Ressurs<string>) => {
            if (response.status === RessursStatus.Suksess) {
                lukkModal();
            } else {
                if (
                    response.status === RessursStatus.Feilet ||
                    response.status === RessursStatus.FunksjonellFeil
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
