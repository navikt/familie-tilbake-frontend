import type { BrevPayload } from '~/typer/api';

import { useQueryClient } from '@tanstack/react-query';
import createUseContext from 'constate';
import { useState } from 'react';

import { useDokumentApi } from '~/api/dokument';
import { useBehandling } from '~/context/BehandlingContext';
import { hentBehandlingQueryKey } from '~/generated/@tanstack/react-query.gen';
import {
    type Avhengigheter,
    type FeltState,
    ok,
    useFelt,
    useSkjema,
    Valideringsstatus,
} from '~/hooks/skjema';
import { DokumentMal } from '~/kodeverk';
import { type Ressurs, RessursStatus } from '~/typer/ressurs';
import { erFeltetEmpty, hentFrontendFeilmelding, validerTekstFeltMaksLengde } from '~/utils';

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

const [SendMeldingProvider, useSendMelding] = createUseContext(() => {
    const { behandlingId, varselSendt } = useBehandling();
    const queryClient = useQueryClient();
    const [senderInn, settSenderInn] = useState<boolean>(false);
    const [feilmelding, settFeilmelding] = useState<string | undefined>();
    const { bestillBrev } = useDokumentApi();

    const maler = [
        varselSendt ? DokumentMal.KorrigertVarsel : DokumentMal.Varsel,
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
            behandlingId: behandlingId,
            brevmalkode: skjema.felter.maltype.verdi as DokumentMal,
            fritekst: skjema.felter.fritekst.verdi,
        };
    };

    const sendBrev = (): void => {
        validerAlleSynligeFelter();
        if (kanSendeSkjema()) {
            settSenderInn(true);
            bestillBrev(hentBrevdata()).then(async (respons: Ressurs<void>) => {
                settSenderInn(false);
                settFeilmelding(undefined);
                if (respons.status === RessursStatus.Suksess) {
                    nullstillSkjema();
                    await queryClient.invalidateQueries({
                        queryKey: hentBehandlingQueryKey({ path: { behandlingId: behandlingId } }),
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
