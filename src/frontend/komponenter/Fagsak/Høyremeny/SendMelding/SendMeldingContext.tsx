import type { BrevPayload } from '../../../../typer/api';
import type { Behandling } from '../../../../typer/behandling';

import createUseContext from 'constate';
import * as React from 'react';
import { useNavigate } from 'react-router';

import { useDokumentApi } from '../../../../api/dokument';
import { useBehandling } from '../../../../context/BehandlingContext';
import { useFagsak } from '../../../../context/FagsakContext';
import {
    type Avhengigheter,
    type FeltState,
    ok,
    useFelt,
    useSkjema,
    Valideringsstatus,
} from '../../../../hooks/skjema';
import { DokumentMal } from '../../../../kodeverk';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';
import {
    erFeltetEmpty,
    hentFrontendFeilmelding,
    validerTekstFeltMaksLengde,
} from '../../../../utils';
import { SYNLIGE_STEG } from '../../../../utils/sider';

type Mottaker = {
    verdi: string;
    label: string;
};

const Mottakere: Mottaker[] = [
    {
        verdi: 'BRUKER',
        label: 'Søker',
    },
];

type SendMeldingSkjemaDefinisjon = {
    mottaker: Mottaker;
    maltype: DokumentMal | '';
    fritekst: string | '';
};

const erAvhengigheterOppfyltFritekst = (avhengigheter?: Avhengigheter): boolean =>
    avhengigheter?.maltype.valideringsstatus === Valideringsstatus.Ok;

type Props = {
    behandling: Behandling;
};

const [SendMeldingProvider, useSendMelding] = createUseContext(({ behandling }: Props) => {
    const { fagsak } = useFagsak();
    const [senderInn, settSenderInn] = React.useState<boolean>(false);
    const [feilmelding, settFeilmelding] = React.useState<string | undefined>();
    const { hentBehandlingMedBehandlingId } = useBehandling();
    const { bestillBrev } = useDokumentApi();
    const navigate = useNavigate();

    const maler = [
        behandling.varselSendt ? DokumentMal.KorrigertVarsel : DokumentMal.Varsel,
        DokumentMal.InnhentDokumentasjon,
    ];

    const maltype = useFelt<DokumentMal | ''>({
        verdi: '',
        valideringsfunksjon: (felt: FeltState<DokumentMal | ''>) => {
            return erFeltetEmpty(felt);
        },
    });

    const { skjema, kanSendeSkjema, validerAlleSynligeFelter, nullstillSkjema } = useSkjema<
        SendMeldingSkjemaDefinisjon,
        string
    >({
        felter: {
            mottaker: useFelt<Mottaker>({
                verdi: Mottakere[0],
            }),
            maltype,
            fritekst: useFelt<string | ''>({
                verdi: '',
                avhengigheter: { maltype },
                valideringsfunksjon: (
                    felt: FeltState<string | ''>,
                    avhengigheter?: Avhengigheter
                ) => {
                    if (!erAvhengigheterOppfyltFritekst(avhengigheter)) return ok(felt);
                    return validerTekstFeltMaksLengde(3000, felt);
                },
            }),
        },
        skjemanavn: 'sendmelding',
    });

    const hentBrevdata = (): BrevPayload => {
        return {
            behandlingId: behandling.behandlingId,
            brevmalkode: skjema.felter.maltype.verdi as DokumentMal,
            fritekst: skjema.felter.fritekst.verdi,
        };
    };

    const sendBrev = (): void => {
        validerAlleSynligeFelter();
        if (kanSendeSkjema()) {
            settSenderInn(true);
            bestillBrev(hentBrevdata()).then((respons: Ressurs<void>) => {
                settSenderInn(false);
                settFeilmelding(undefined);
                if (respons.status === RessursStatus.Suksess) {
                    nullstillSkjema();
                    hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                        navigate(
                            `/fagsystem/${fagsak?.fagsystem}/fagsak/${fagsak?.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${SYNLIGE_STEG.VERGE.href}`
                        );
                    });
                } else {
                    settFeilmelding(hentFrontendFeilmelding(respons));
                }
            });
        } else {
            settSenderInn(false);
        }
    };

    return {
        behandling,
        maler,
        skjema,
        hentBrevdata,
        kanSendeSkjema,
        senderInn,
        sendBrev,
        feilmelding,
    };
});

export { SendMeldingProvider, useSendMelding };
