import {
    type Avhengigheter,
    type FeltState,
    ok,
    useFelt,
    useSkjema,
    Valideringsstatus,
} from '@navikt/familie-skjema';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useBehandlingApi } from '../../../../../../api/behandling';
import { useBehandling } from '../../../../../../context/BehandlingContext';
import { HenleggBehandlingPaylod } from '../../../../../../typer/api';
import {
    Behandlingresultat,
    Behandlingstype,
    IBehandling,
} from '../../../../../../typer/behandling';
import { erFeltetEmpty, validerTekstFeltMaksLengde } from '../../../../../../utils';

const erAvhengigheterOppfyltFritekst = (avhengigheter?: Avhengigheter) =>
    avhengigheter?.behandlingstype.valideringsstatus === Valideringsstatus.OK &&
    avhengigheter?.behandlingstype.verdi === Behandlingstype.REVURDERING_TILBAKEKREVING &&
    avhengigheter?.årsakkode.valideringsstatus === Valideringsstatus.OK &&
    avhengigheter?.årsakkode.verdi === Behandlingresultat.HENLAGT_FEILOPPRETTET_MED_BREV;

export type HenleggelseSkjemaDefinisjon = {
    årsakkode: Behandlingresultat | '';
    behandlingstype: Behandlingstype | '';
    begrunnelse: string | '';
    fritekst: string | '';
};

interface IProps {
    behandling: IBehandling;
    settVisModal: (vis: boolean) => void;
}

export const useHenleggBehandlingSkjema = ({ behandling, settVisModal }: IProps) => {
    const { hentBehandlingMedBehandlingId } = useBehandling();
    const { henleggBehandling } = useBehandlingApi();
    const { nullstillIkkePersisterteKomponenter } = useBehandling();

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

    const onBekreft = () => {
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
                    if (response.status === RessursStatus.SUKSESS) {
                        settVisModal(false);
                        hentBehandlingMedBehandlingId(behandling.behandlingId);
                    }
                }
            );
        }
    };

    const erÅrsakValgt = () => skjema.felter.årsakkode.valideringsstatus === Valideringsstatus.OK;

    const erVisFritekst = () =>
        erÅrsakValgt() &&
        skjema.felter.behandlingstype.verdi === Behandlingstype.REVURDERING_TILBAKEKREVING &&
        skjema.felter.årsakkode.verdi === Behandlingresultat.HENLAGT_FEILOPPRETTET_MED_BREV;

    const erKanForhåndsvise = () => {
        switch (skjema.felter.behandlingstype.verdi) {
            case Behandlingstype.REVURDERING_TILBAKEKREVING:
                return (
                    erVisFritekst() &&
                    skjema.felter.fritekst.valideringsstatus === Valideringsstatus.OK
                );
            case Behandlingstype.TILBAKEKREVING:
            default:
                return behandling.varselSendt && erÅrsakValgt();
        }
    };

    return {
        skjema,
        erVisFritekst,
        onBekreft,
        nullstillSkjema,
        erKanForhåndsvise,
    };
};
