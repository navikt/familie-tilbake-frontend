import * as React from 'react';

import createUseContext from 'constate';

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

import { useBehandling } from '../../../../context/BehandlingContext';
import { DokumentMal } from '../../../../kodeverk';
import { IBehandling } from '../../../../typer/behandling';
import { erFeltetEmpty, validerTekstFeltMaksLengde } from '../../../../utils';
import { BrevPayload } from './ForhåndsvisBrev/useForhåndsvisBrev';

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
}

const [SendMeldingProvider, useSendMelding] = createUseContext(({ behandling }: IProps) => {
    const [senderInn, settSenderInn] = React.useState<boolean>(false);
    const { hentBehandlingMedBehandlingId } = useBehandling();
    const { request } = useHttp();

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
            request<BrevPayload, void>({
                method: 'POST',
                url: '/familie-tilbake/api/dokument/bestill',
                data: hentBrevdata(),
            }).then((respons: Ressurs<void>) => {
                settSenderInn(false);
                if (respons.status === RessursStatus.SUKSESS) {
                    nullstillSkjema();
                    hentBehandlingMedBehandlingId(behandling.behandlingId, true);
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
