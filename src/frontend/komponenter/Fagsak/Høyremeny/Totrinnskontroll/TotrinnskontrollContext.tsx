import type { TotrinnGodkjenningOption, TotrinnStegSkjemaData } from './typer/totrinnSkjemaTyper';
import type { BehandlingsstegEnum } from '../../../../generated';
import type { FatteVedtakStegPayload, TotrinnsStegVurdering } from '../../../../typer/api';
import type { Totrinnkontroll } from '../../../../typer/totrinnTyper';
import type { SynligSteg } from '../../../../utils/sider';

import { useQueryClient } from '@tanstack/react-query';
import createUseContext from 'constate';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { OptionIkkeGodkjent, totrinnGodkjenningOptions } from './typer/totrinnSkjemaTyper';
import { useBehandlingApi } from '../../../../api/behandling';
import { useBehandling } from '../../../../context/BehandlingContext';
import { useBehandlingState } from '../../../../context/BehandlingStateContext';
import { useFagsak } from '../../../../context/FagsakContext';
import { hentBehandlingQueryKey } from '../../../../generated/@tanstack/react-query.gen';
import { behandlingssteg } from '../../../../typer/behandling';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    type Ressurs,
    RessursStatus,
} from '../../../../typer/ressurs';
import { hentFrontendFeilmelding, validerTekstMaksLengde } from '../../../../utils';

const finnTotrinnGodkjenningOption = (verdi?: boolean): TotrinnGodkjenningOption | '' => {
    const option = totrinnGodkjenningOptions.find(opt => opt.verdi === verdi);
    return option || '';
};

const validerTekst2000 = validerTekstMaksLengde(2000);

const stegRekkefølge: BehandlingsstegEnum[] = [
    'FAKTA',
    'FORELDELSE',
    'VILKÅRSVURDERING',
    'FORESLÅ_VEDTAK',
];

const [TotrinnskontrollProvider, useTotrinnskontroll] = createUseContext(() => {
    const behandling = useBehandling();
    const { fagsystem, eksternFagsakId } = useFagsak();
    const { visGlobalAlert } = useBehandlingState();
    const queryClient = useQueryClient();
    const [totrinnkontroll, settTotrinnkontroll] = useState<Ressurs<Totrinnkontroll>>();
    const [skjemaData, settSkjemaData] = useState<TotrinnStegSkjemaData[]>([]);
    const [erLesevisning, settErLesevisning] = useState<boolean>(false);
    const [nonUsedKey, settNonUsedKey] = useState<string>(Date.now().toString());
    const [stegErBehandlet, settStegErBehandlet] = useState<boolean>(false);
    const [senderInn, settSenderInn] = useState<boolean>(false);
    const [fatteVedtakRespons, settFatteVedtakRespons] = useState<Ressurs<string>>();
    const [disableBekreft, settDisableBekreft] = useState<boolean>(true);
    const [sendTilSaksbehandler, settSendTilSaksbehandler] = useState<boolean>(true);
    const { erStegBehandlet, erBehandlingReturnertFraBeslutter } = useBehandlingState();
    const { gjerTotrinnkontrollKall, sendInnFatteVedtak, kallAngreSendTilBeslutter } =
        useBehandlingApi();
    const navigate = useNavigate();
    const [feilmelding, settFeilmelding] = useState<string>('');
    const [laster, settLaster] = useState(false);

    useEffect(() => {
        settStegErBehandlet(erStegBehandlet('FATTE_VEDTAK'));
        settErLesevisning(!behandling.kanEndres || erBehandlingReturnertFraBeslutter());
        hentTotrinnkontroll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behandling]);

    useEffect(() => {
        if (totrinnkontroll?.status === RessursStatus.Suksess) {
            const totrinn = totrinnkontroll.data.totrinnsstegsinfo;
            settSkjemaData(
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
        settDisableBekreft(stegIkkeVurdert || harValideringsFeil);
        settSendTilSaksbehandler(!stegIkkeVurdert && !harValideringsFeil && !alleGodkjent);
    }, [skjemaData, nonUsedKey]);

    const hentTotrinnkontroll = (): void => {
        settTotrinnkontroll(byggHenterRessurs());
        gjerTotrinnkontrollKall(behandling.behandlingId)
            .then((hentetTotrinnkontroll: Ressurs<Totrinnkontroll>) => {
                settTotrinnkontroll(hentetTotrinnkontroll);
            })
            .catch(() => {
                settTotrinnkontroll(
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
            settSkjemaData(totrinnsSteg);
            settNonUsedKey(Date.now().toString());
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
            settSkjemaData(totrinnsSteg);
            settNonUsedKey(Date.now().toString());
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
        settSkjemaData(nySkjemaData);
        settNonUsedKey(Date.now().toString());
        return !harFeil;
    };

    const angreSendTilBeslutter = (): void => {
        if (laster) {
            return;
        }
        settLaster(true);
        settFeilmelding('');
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
                    settFeilmelding(
                        hentFrontendFeilmelding(res) ?? 'Ukjent feil ved angre send til beslutter'
                    );
                }
            })
            .finally(() => {
                settLaster(false);
            });
    };

    const sendInnSkjema = (): void => {
        if (validerToTrinn()) {
            if (senderInn) {
                return;
            }
            settSenderInn(true);
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

            sendInnFatteVedtak(behandling.behandlingId, payload)
                .then(async (respons: Ressurs<string>) => {
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
                    } else if (
                        respons.status === RessursStatus.Feilet ||
                        respons.status === RessursStatus.FunksjonellFeil
                    ) {
                        settFatteVedtakRespons(respons);
                    }
                })
                .catch(() => {
                    settFatteVedtakRespons(byggFeiletRessurs('Ukjent feil ved sending av vedtak'));
                })
                .finally(() => {
                    settSenderInn(false);
                });
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
