/* eslint-disable @eslint-react/set-state-in-effect --
 * Flere useEffect-blokker utleder lokal state fra backend-hentet Ressurs<T> (klassisk
 * fetch-pattern). En ordentlig løsning krever migrering av disse kallene til TanStack
 * Query (useQuery) slik at server state håndteres deklarativt uten useEffect-basert
 * synkronisering. Omfanget av endringen er stort siden konteksten eksponerer avledet
 * skjemaData, valideringsstate og sendInn-flyt på en måte som forutsetter nåværende
 * arkitektur.
 */
import type { TotrinnGodkjenningOption, TotrinnStegSkjemaData } from './typer/totrinnSkjemaTyper';
import type { BehandlingsstegEnum } from '~/generated';
import type { FatteVedtakStegPayload, TotrinnsStegVurdering } from '~/typer/api';
import type { Totrinnkontroll } from '~/typer/totrinnTyper';
import type { SynligSteg } from '~/utils/sider';

import { useQueryClient } from '@tanstack/react-query';
import createUseContext from 'constate';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useBehandlingApi } from '~/api/behandling';
import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { useFagsak } from '~/context/FagsakContext';
import { hentBehandlingQueryKey } from '~/generated/@tanstack/react-query.gen';
import { useVisGlobalAlert } from '~/stores/globalAlertStore';
import { behandlingssteg } from '~/typer/behandling';
import { byggFeiletRessurs, byggHenterRessurs, type Ressurs, RessursStatus } from '~/typer/ressurs';
import { hentFrontendFeilmelding, validerTekstMaksLengde } from '~/utils';

import { OptionIkkeGodkjent, totrinnGodkjenningOptions } from './typer/totrinnSkjemaTyper';

const finnTotrinnGodkjenningOption = (verdi?: boolean): TotrinnGodkjenningOption | '' => {
    const option = totrinnGodkjenningOptions.find(opt => opt.verdi === verdi);
    return option || '';
};

const validerTekst2000 = validerTekstMaksLengde(2000);

const stegRekkefølge: BehandlingsstegEnum[] = [
    'FAKTA',
    'FORHÅNDSVARSEL',
    'FORELDELSE',
    'VILKÅRSVURDERING',
    'FORESLÅ_VEDTAK',
];

const [TotrinnskontrollProvider, useTotrinnskontroll] = createUseContext(() => {
    const behandling = useBehandling();
    const { fagsystem, eksternFagsakId } = useFagsak();
    const visGlobalAlert = useVisGlobalAlert();
    const queryClient = useQueryClient();
    const [totrinnkontroll, setTotrinnkontroll] = useState<Ressurs<Totrinnkontroll>>();
    const [skjemaData, setSkjemaData] = useState<TotrinnStegSkjemaData[]>([]);
    const [erLesevisning, setErLesevisning] = useState<boolean>(false);
    const [nonUsedKey, setNonUsedKey] = useState<string>(Date.now().toString());
    const [stegErBehandlet, setStegErBehandlet] = useState<boolean>(false);
    const [senderInn, setSenderInn] = useState<boolean>(false);
    const [fatteVedtakRespons, setFatteVedtakRespons] = useState<Ressurs<string>>();
    const [disableBekreft, setDisableBekreft] = useState<boolean>(true);
    const [sendTilSaksbehandler, setSendTilSaksbehandler] = useState<boolean>(true);
    const { erStegBehandlet, erBehandlingReturnertFraBeslutter } = useBehandlingState();
    const { gjerTotrinnkontrollKall, sendInnFatteVedtak, kallAngreSendTilBeslutter } =
        useBehandlingApi();
    const navigate = useNavigate();
    const [feilmelding, setFeilmelding] = useState<string>('');
    const [laster, setLaster] = useState(false);

    useEffect(() => {
        setStegErBehandlet(erStegBehandlet('FATTE_VEDTAK'));
        setErLesevisning(!behandling.kanEndres || erBehandlingReturnertFraBeslutter());
        hentTotrinnkontroll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behandling]);

    useEffect(() => {
        if (totrinnkontroll?.status === RessursStatus.Suksess) {
            const totrinn = totrinnkontroll.data.totrinnsstegsinfo;
            setSkjemaData(
                stegRekkefølge
                    .filter(steg => totrinn.some(tt => tt.behandlingssteg === steg))
                    .map((steg, index) => {
                        const stegInfo = totrinn.find(tt => tt.behandlingssteg === steg);
                        return {
                            index: `idx_steg_${index}`,
                            behandlingssteg: stegInfo?.behandlingssteg as BehandlingsstegEnum,
                            godkjent: finnTotrinnGodkjenningOption(stegInfo?.godkjent),
                            begrunnelse: stegInfo?.begrunnelse,
                        };
                    })
            );
        }
    }, [totrinnkontroll]);

    useEffect(() => {
        const stegIkkeVurdert = skjemaData.some(totrinn => !totrinn.godkjent);
        const alleGodkjent =
            !stegIkkeVurdert &&
            !skjemaData.some(totrinn => !!totrinn && totrinn.godkjent === OptionIkkeGodkjent);
        const harValideringsFeil =
            !alleGodkjent &&
            skjemaData.some(
                totrinn =>
                    totrinn.harFeilIBegrunnelse ||
                    (totrinn.godkjent === OptionIkkeGodkjent && !totrinn.begrunnelse)
            );
        setDisableBekreft(stegIkkeVurdert || harValideringsFeil);
        setSendTilSaksbehandler(!stegIkkeVurdert && !harValideringsFeil && !alleGodkjent);
    }, [skjemaData, nonUsedKey]);

    const hentTotrinnkontroll = (): void => {
        setTotrinnkontroll(byggHenterRessurs());
        gjerTotrinnkontrollKall(behandling.behandlingId)
            .then((hentetTotrinnkontroll: Ressurs<Totrinnkontroll>) => {
                setTotrinnkontroll(hentetTotrinnkontroll);
            })
            .catch(() => {
                setTotrinnkontroll(
                    byggFeiletRessurs('Ukjent feil ved henting av to-trinnskontroll for behandling')
                );
            });
    };

    const oppdaterGodkjenning = (stegIndex: string, verdi: TotrinnGodkjenningOption): void => {
        const totrinnsSteg = skjemaData;
        const ttsIndex = totrinnsSteg.findIndex(steg => steg.index === stegIndex);
        const steg = totrinnsSteg.find(steg => steg.index === stegIndex);
        if (steg) {
            totrinnsSteg.splice(ttsIndex, 1, {
                ...steg,
                godkjent: verdi,
            });
            setSkjemaData(totrinnsSteg);
            setNonUsedKey(Date.now().toString());
        }
    };

    const oppdaterBegrunnelse = (stegIndex: string, verdi: string): void => {
        const totrinnsSteg = skjemaData;
        const ttsIndex = totrinnsSteg.findIndex(steg => steg.index === stegIndex);
        const steg = totrinnsSteg.find(steg => steg.index === stegIndex);
        const feilmelding = validerTekst2000(verdi);
        if (steg) {
            totrinnsSteg.splice(ttsIndex, 1, {
                ...steg,
                begrunnelse: verdi,
                harFeilIBegrunnelse: !!feilmelding,
                begrunnelseFeilmelding: feilmelding || undefined,
            });
            setSkjemaData(totrinnsSteg);
            setNonUsedKey(Date.now().toString());
        }
    };

    const validerToTrinn = (): boolean => {
        let harFeil = false;
        const nySkjemaData = skjemaData.map(totrinn => {
            let feilmelding;
            let begrunnelseFeilmelding;
            if (!totrinn.godkjent) {
                feilmelding = `${behandlingssteg[totrinn.behandlingssteg]} må vurderes`;
            }
            if (totrinn.godkjent === OptionIkkeGodkjent) {
                // @ts-expect-error har verdi her
                begrunnelseFeilmelding = validerTekst2000(totrinn.begrunnelse);
            }

            harFeil = harFeil || !!feilmelding || !!begrunnelseFeilmelding;
            return {
                ...totrinn,
                feilmelding: feilmelding || undefined,
                harFeilIBegrunnelse: !!begrunnelseFeilmelding,
                begrunnelseFeilmelding: begrunnelseFeilmelding || undefined,
            };
        });
        setSkjemaData(nySkjemaData);
        setNonUsedKey(Date.now().toString());
        return !harFeil;
    };

    const angreSendTilBeslutter = (): void => {
        if (laster) {
            return;
        }
        setLaster(true);
        setFeilmelding('');
        kallAngreSendTilBeslutter(behandling.behandlingId)
            .then(async (res: Ressurs<string>) => {
                if (res.status === RessursStatus.Suksess) {
                    await queryClient.invalidateQueries({
                        queryKey: hentBehandlingQueryKey({
                            path: { behandlingId: behandling.behandlingId },
                        }),
                    });
                    visGlobalAlert({
                        title: 'Godkjenning er avbrutt',
                        message:
                            'Du kan gjøre endringer før du sender behandlingen til godkjenning på nytt.',
                        status: 'success',
                    });
                } else {
                    setFeilmelding(
                        hentFrontendFeilmelding(res) ?? 'Ukjent feil ved angre send til beslutter'
                    );
                }
            })
            .finally(() => {
                setLaster(false);
            });
    };

    const sendInnSkjema = async (onSuccess?: () => void): Promise<void> => {
        if (validerToTrinn()) {
            if (senderInn) {
                return;
            }
            setSenderInn(true);
            const payload: FatteVedtakStegPayload = {
                '@type': 'FATTE_VEDTAK',
                // @ts-expect-error har verdi her
                totrinnsvurderinger: skjemaData.map<TotrinnsStegVurdering>(ttSteg => {
                    const ikkkGodkjent = ttSteg.godkjent === OptionIkkeGodkjent;
                    return {
                        behandlingssteg: ttSteg.behandlingssteg,
                        // @ts-expect-error har verdi her
                        godkjent: ttSteg.godkjent?.verdi,
                        begrunnelse: ikkkGodkjent ? ttSteg.begrunnelse : null,
                    };
                }),
            };

            try {
                const respons = await sendInnFatteVedtak(behandling.behandlingId, payload);
                if (respons.status === RessursStatus.Suksess) {
                    await queryClient.invalidateQueries({
                        queryKey: hentBehandlingQueryKey({
                            path: { behandlingId: behandling.behandlingId },
                        }),
                    });
                    if (sendTilSaksbehandler) {
                        visGlobalAlert({
                            title: 'Sendt til saksbehandler',
                            message:
                                'Behandlingen er sendt tilbake til saksbehandler for en ny vurdering.',
                            status: 'success',
                        });
                    } else {
                        visGlobalAlert({
                            title: 'Vedtaket er godkjent',
                            message: 'Behandlingen er godkjent og du kan lukke denne saken.',
                            status: 'success',
                        });
                    }
                    onSuccess?.();
                } else if (
                    respons.status === RessursStatus.Feilet ||
                    respons.status === RessursStatus.FunksjonellFeil
                ) {
                    setFatteVedtakRespons(respons);
                }
            } catch {
                setFatteVedtakRespons(byggFeiletRessurs('Ukjent feil ved sending av vedtak'));
            } finally {
                setSenderInn(false);
            }
        }
    };

    const navigerTilSide = (side: SynligSteg): void => {
        navigate(
            `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}/${side.href}`
        );
    };

    return {
        stegErBehandlet,
        navigerTilSide,
        totrinnkontroll,
        skjemaData,
        oppdaterGodkjenning,
        oppdaterBegrunnelse,
        sendInnSkjema,
        disableBekreft,
        sendTilSaksbehandler,
        senderInn,
        nonUsedKey,
        fatteVedtakRespons,
        angreSendTilBeslutter,
        feilmelding,
        erLesevisning,
    };
});

export { TotrinnskontrollProvider, useTotrinnskontroll };
