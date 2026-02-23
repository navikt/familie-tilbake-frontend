import type { BehandlingsresultatstypeEnum, BehandlingstypeEnum } from '~/generated';
import type { Avhengigheter, FeltState, Skjema } from '~/hooks/skjema';
import type { HenleggBehandlingPaylod } from '~/typer/api';

import { useQueryClient } from '@tanstack/react-query';

import { useBehandlingApi } from '~/api/behandling';
import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { hentBehandlingQueryKey } from '~/generated/@tanstack/react-query.gen';
import { ok, useFelt, useSkjema, Valideringsstatus } from '~/hooks/skjema';
import { type Ressurs, RessursStatus } from '~/typer/ressurs';
import { erFeltetEmpty, validerTekstFeltMaksLengde } from '~/utils';

const erAvhengigheterOppfyltFritekst = (avhengigheter?: Avhengigheter): boolean =>
    avhengigheter?.behandlingstype.valideringsstatus === Valideringsstatus.Ok &&
    avhengigheter?.behandlingstype.verdi === 'REVURDERING_TILBAKEKREVING' &&
    avhengigheter?.årsakkode.valideringsstatus === Valideringsstatus.Ok &&
    avhengigheter?.årsakkode.verdi === 'HENLAGT_FEILOPPRETTET_MED_BREV';

export type HenleggelseSkjemaDefinisjon = {
    årsakkode: BehandlingsresultatstypeEnum | '';
    behandlingstype: BehandlingstypeEnum | '';
    begrunnelse: string | '';
    fritekst: string | '';
};

type Props = {
    lukkModal: () => void;
};

type HenleggBehandlingSkjemaHook = {
    skjema: Skjema<HenleggelseSkjemaDefinisjon, string>;
    visFritekst: () => boolean;
    onBekreft: () => void;
    nullstillSkjema: () => void;
    kanForhåndsvise: () => boolean;
};

export const useHenleggSkjema = ({ lukkModal }: Props): HenleggBehandlingSkjemaHook => {
    const queryClient = useQueryClient();
    const { henleggBehandling } = useBehandlingApi();
    const { behandlingId, varselSendt } = useBehandling();
    const { nullstillIkkePersisterteKomponenter } = useBehandlingState();

    const årsakkode = useFelt<BehandlingsresultatstypeEnum | ''>({
        verdi: '',
        valideringsfunksjon: (felt: FeltState<BehandlingsresultatstypeEnum | ''>) => {
            return erFeltetEmpty(felt);
        },
    });
    const behandlingstype = useFelt<BehandlingstypeEnum | ''>({
        verdi: '',
    });

    const { skjema, validerAlleSynligeFelter, kanSendeSkjema, nullstillSkjema } = useSkjema<
        HenleggelseSkjemaDefinisjon,
        string
    >({
        felter: {
            årsakkode,
            behandlingstype,
            begrunnelse: useFelt<string | ''>({
                verdi: '',
                valideringsfunksjon: (felt: FeltState<string | ''>) => {
                    return validerTekstFeltMaksLengde(200, felt);
                },
            }),
            fritekst: useFelt<string | ''>({
                verdi: '',
                avhengigheter: { årsakkode, behandlingstype },
                valideringsfunksjon: (
                    felt: FeltState<string | ''>,
                    avhengigheter?: Avhengigheter
                ) => {
                    if (!erAvhengigheterOppfyltFritekst(avhengigheter)) return ok(felt);
                    return validerTekstFeltMaksLengde(1500, felt);
                },
            }),
        },
        skjemanavn: 'henleggBehandling',
    });

    const onBekreft = (): void => {
        validerAlleSynligeFelter();
        if (kanSendeSkjema()) {
            nullstillIkkePersisterteKomponenter();
            const payload: HenleggBehandlingPaylod = {
                //@ts-expect-error har verdi her
                behandlingsresultatstype: skjema.felter.årsakkode.verdi,
                begrunnelse: skjema.felter.begrunnelse.verdi,
                fritekst: skjema.felter.fritekst.verdi,
            };
            henleggBehandling(behandlingId, payload).then(async (response: Ressurs<string>) => {
                if (response.status === RessursStatus.Suksess) {
                    lukkModal();
                    await queryClient.invalidateQueries({
                        queryKey: hentBehandlingQueryKey({ path: { behandlingId: behandlingId } }),
                    });
                }
            });
        }
    };

    const erÅrsakValgt = (): boolean =>
        skjema.felter.årsakkode.valideringsstatus === Valideringsstatus.Ok;

    const visFritekst = (): boolean =>
        erÅrsakValgt() &&
        skjema.felter.behandlingstype.verdi === 'REVURDERING_TILBAKEKREVING' &&
        skjema.felter.årsakkode.verdi === 'HENLAGT_FEILOPPRETTET_MED_BREV';

    const kanForhåndsvise = (): boolean => {
        switch (skjema.felter.behandlingstype.verdi) {
            case 'REVURDERING_TILBAKEKREVING':
                return (
                    visFritekst() &&
                    skjema.felter.fritekst.valideringsstatus === Valideringsstatus.Ok
                );
            case 'TILBAKEKREVING':
            default:
                return varselSendt && erÅrsakValgt();
        }
    };

    return {
        skjema,
        visFritekst,
        onBekreft,
        nullstillSkjema,
        kanForhåndsvise,
    };
};
