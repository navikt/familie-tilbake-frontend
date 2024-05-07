import * as React from 'react';

import createUseContext from 'constate';
import { useNavigate } from 'react-router-dom';

import {
    type Avhengigheter,
    type FeltState,
    ok,
    useFelt,
    useSkjema,
    Valideringsstatus,
} from '@navikt/familie-skjema';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useDokumentApi } from '../../../../api/dokument';
import { useBehandling } from '../../../../context/BehandlingContext';
import { DokumentMal } from '../../../../kodeverk';
import { BrevPayload } from '../../../../typer/api';
import { IBehandling } from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';
import { erFeltetEmpty, validerTekstFeltMaksLengde } from '../../../../utils';
import { sider } from '../../../Felleskomponenter/Venstremeny/sider';

interface Mottaker {
    verdi: string;
    label: string;
}

export const Mottakere: Mottaker[] = [
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

const erAvhengigheterOppfyltFritekst = (avhengigheter?: Avhengigheter) =>
    avhengigheter?.maltype.valideringsstatus === Valideringsstatus.OK;

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
}

const [SendMeldingProvider, useSendMelding] = createUseContext(({ behandling, fagsak }: IProps) => {
    const [senderInn, settSenderInn] = React.useState<boolean>(false);
    const { hentBehandlingMedBehandlingId } = useBehandling();
    const { bestillBrev } = useDokumentApi();
    const navigate = useNavigate();

    const maler = [
        behandling.varselSendt ? DokumentMal.KORRIGERT_VARSEL : DokumentMal.VARSEL,
        DokumentMal.INNHENT_DOKUMENTASJON,
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

    const sendBrev = () => {
        validerAlleSynligeFelter();
        if (kanSendeSkjema()) {
            settSenderInn(true);
            bestillBrev(hentBrevdata()).then((respons: Ressurs<void>) => {
                settSenderInn(false);
                if (respons.status === RessursStatus.SUKSESS) {
                    nullstillSkjema();
                    hentBehandlingMedBehandlingId(behandling.behandlingId);
                    navigate(
                        `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.VERGE.href}`
                    );
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
    };
});

export { SendMeldingProvider, useSendMelding };
