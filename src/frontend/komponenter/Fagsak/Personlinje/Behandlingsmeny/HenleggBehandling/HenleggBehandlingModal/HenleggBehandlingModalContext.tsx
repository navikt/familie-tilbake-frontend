import { useHttp } from '@navikt/familie-http';
import {
    Avhengigheter,
    FeltState,
    ok,
    useFelt,
    useSkjema,
    Valideringsstatus,
} from '@navikt/familie-skjema';
import { Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../../../context/BehandlingContext';
import {
    Behandlingresultat,
    Behandlingstype,
    IBehandling,
} from '../../../../../../typer/behandling';
import {
    erFeltetEmpty,
    validerTekstFelt,
    validerTekstFeltMaksLengde,
} from '../../../../../../utils';

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

interface HenleggBehandlingPaylod {
    behandlingsresultatstype: Behandlingresultat;
    begrunnelse: string;
    fritekst: string;
}

interface IProps {
    behandling: IBehandling;
    settVisModal: (vis: boolean) => void;
}

export const useHenleggBehandlingSkjema = ({ behandling, settVisModal }: IProps) => {
    const { hentBehandlingMedBehandlingId } = useBehandling();
    const { request } = useHttp();

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
                    return validerTekstFelt(felt);
                },
            }),
        },
        skjemanavn: 'henleggBehandling',
    });

    const onBekreft = (id: string) => {
        validerAlleSynligeFelter();
        if (kanSendeSkjema()) {
            console.log('Henlegger behandling ', id);
            const payload: HenleggBehandlingPaylod = {
                //@ts-ignore
                behandlingsresultatstype: skjema.felter.årsakkode.verdi,
                begrunnelse: skjema.felter.begrunnelse.verdi,
                fritekst: skjema.felter.fritekst.verdi,
            };
            request<HenleggBehandlingPaylod, string>({
                method: 'PUT',
                url: `/familie-tilbake/api/behandling/${behandling.behandlingId}/henlegg/v1`,
                data: payload,
            }).then((response: Ressurs<string>) => {
                if (response.status === RessursStatus.SUKSESS) {
                    settVisModal(false);
                    hentBehandlingMedBehandlingId(behandling.behandlingId);
                }
            });
        }
    };

    const erÅrsakValgt = () => skjema.felter.årsakkode.valideringsstatus === Valideringsstatus.OK;

    const erVisFritekst = () =>
        erÅrsakValgt() &&
        skjema.felter.behandlingstype.verdi === Behandlingstype.REVURDERING_TILBAKEKREVING &&
        skjema.felter.årsakkode.verdi === Behandlingresultat.HENLAGT_FEILOPPRETTET_MED_BREV;

    return {
        skjema,
        erÅrsakValgt,
        erVisFritekst,
        onBekreft,
        nullstillSkjema,
    };
};
