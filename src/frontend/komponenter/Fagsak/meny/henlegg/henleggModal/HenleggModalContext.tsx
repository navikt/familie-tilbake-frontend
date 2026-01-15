import type { Avhengigheter, FeltState, Skjema } from '../../../../../hooks/skjema';
import type { HenleggBehandlingPaylod } from '../../../../../typer/api';

import { useQueryClient } from '@tanstack/react-query';

import { useBehandlingApi } from '../../../../../api/behandling';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { ok, useFelt, useSkjema, Valideringsstatus } from '../../../../../hooks/skjema';
import { Behandlingresultat, Behandlingstype } from '../../../../../typer/behandling';
import { type Ressurs, RessursStatus } from '../../../../../typer/ressurs';
import { erFeltetEmpty, validerTekstFeltMaksLengde } from '../../../../../utils';

const erAvhengigheterOppfyltFritekst = (avhengigheter?: Avhengigheter): boolean =>
    avhengigheter?.behandlingstype.valideringsstatus === Valideringsstatus.Ok &&
    avhengigheter?.behandlingstype.verdi === Behandlingstype.RevurderingTilbakekreving &&
    avhengigheter?.årsakkode.valideringsstatus === Valideringsstatus.Ok &&
    avhengigheter?.årsakkode.verdi === Behandlingresultat.HenlagtFeilopprettetMedBrev;

export type HenleggelseSkjemaDefinisjon = {
    årsakkode: Behandlingresultat | '';
    behandlingstype: Behandlingstype | '';
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
    const { behandling, nullstillIkkePersisterteKomponenter } = useBehandling();

    const årsakkode = useFelt<Behandlingresultat | ''>({
        verdi: '',
        valideringsfunksjon: (felt: FeltState<Behandlingresultat | ''>) => {
            return erFeltetEmpty(felt);
        },
    });
    const behandlingstype = useFelt<Behandlingstype | ''>({
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
            henleggBehandling(behandling.behandlingId, payload).then(
                (response: Ressurs<string>) => {
                    if (response.status === RessursStatus.Suksess) {
                        lukkModal();
                        queryClient.invalidateQueries({
                            queryKey: ['behandling', behandling.behandlingId],
                        });
                    }
                }
            );
        }
    };

    const erÅrsakValgt = (): boolean =>
        skjema.felter.årsakkode.valideringsstatus === Valideringsstatus.Ok;

    const visFritekst = (): boolean =>
        erÅrsakValgt() &&
        skjema.felter.behandlingstype.verdi === Behandlingstype.RevurderingTilbakekreving &&
        skjema.felter.årsakkode.verdi === Behandlingresultat.HenlagtFeilopprettetMedBrev;

    const kanForhåndsvise = (): boolean => {
        switch (skjema.felter.behandlingstype.verdi) {
            case Behandlingstype.RevurderingTilbakekreving:
                return (
                    visFritekst() &&
                    skjema.felter.fritekst.valideringsstatus === Valideringsstatus.Ok
                );
            case Behandlingstype.Tilbakekreving:
            default:
                return behandling.varselSendt && erÅrsakValgt();
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
