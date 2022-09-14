import { useState, useEffect } from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';
import { useNavigate } from 'react-router-dom';

import {
    byggFeiletRessurs,
    byggHenterRessurs,
    type Ressurs,
    RessursStatus,
} from '@navikt/familie-typer';

import { useBehandlingApi } from '../../../../api/behandling';
import { useBehandling } from '../../../../context/BehandlingContext';
import { FatteVedtakStegPayload, TotrinnsStegVurdering } from '../../../../typer/api';
import { behandlingssteg, Behandlingssteg, IBehandling } from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';
import { ITotrinnkontroll } from '../../../../typer/totrinnTyper';
import { validerTekstMaksLengde } from '../../../../utils';
import { ISide } from '../../../Felleskomponenter/Venstremeny/sider';
import {
    OptionIkkeGodkjent,
    TotrinnGodkjenningOption,
    totrinnGodkjenningOptions,
    TotrinnStegSkjemaData,
} from './typer/totrinnSkjemaTyper';

const finnTotrinnGodkjenningOption = (verdi?: boolean): TotrinnGodkjenningOption | '' => {
    const option = totrinnGodkjenningOptions.find(opt => opt.verdi === verdi);
    return option || '';
};

const validerTekst2000 = validerTekstMaksLengde(2000);

const stegRekkefølge = [
    Behandlingssteg.FAKTA,
    Behandlingssteg.FORELDELSE,
    Behandlingssteg.VILKÅRSVURDERING,
    Behandlingssteg.FORESLÅ_VEDTAK,
];

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
}

const [TotrinnskontrollProvider, useTotrinnskontroll] = createUseContext(
    ({ fagsak, behandling }: IProps) => {
        const [totrinnkontroll, settTotrinnkontroll] = useState<Ressurs<ITotrinnkontroll>>();
        const [skjemaData, settSkjemaData] = useState<TotrinnStegSkjemaData[]>([]);
        const [fatteVedtakILåsemodus, settFatteVedtakILåsemodus] = useState<boolean>(false);
        const [nonUsedKey, settNonUsedKey] = useState<string>(Date.now().toString());
        const [stegErBehandlet, settStegErBehandlet] = useState<boolean>(false);
        const [senderInn, settSenderInn] = useState<boolean>(false);
        const [fatteVedtakRespons, settFatteVedtakRespons] = useState<Ressurs<string>>();
        const [disableBekreft, settDisableBekreft] = useState<boolean>(true);
        const [sendTilSaksbehandler, settSendTilSaksbehandler] = useState<boolean>(true);
        const {
            visVenteModal,
            erStegBehandlet,
            erBehandlingReturnertFraBeslutter,
            hentBehandlingMedBehandlingId,
        } = useBehandling();
        const { gjerTotrinnkontrollKall, sendInnFatteVedtak } = useBehandlingApi();
        const navigate = useNavigate();

        useEffect(() => {
            if (visVenteModal === false) {
                settStegErBehandlet(erStegBehandlet(Behandlingssteg.FATTE_VEDTAK));
                settFatteVedtakILåsemodus(
                    !behandling.kanEndres || erBehandlingReturnertFraBeslutter()
                );
                hentTotrinnkontroll();
            }
        }, [behandling]);

        useEffect(() => {
            if (totrinnkontroll?.status === RessursStatus.SUKSESS) {
                const totrinn = totrinnkontroll.data.totrinnsstegsinfo;
                settSkjemaData(
                    stegRekkefølge
                        .filter(steg => totrinn.some(tt => tt.behandlingssteg === steg))
                        .map((steg, index) => {
                            const stegInfo = totrinn.find(tt => tt.behandlingssteg === steg);
                            return {
                                index: `idx_steg_${index}`,
                                behandlingssteg: stegInfo?.behandlingssteg as Behandlingssteg,
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

        const hentTotrinnkontroll = () => {
            settTotrinnkontroll(byggHenterRessurs());
            gjerTotrinnkontrollKall(behandling.behandlingId)
                .then((hentetTotrinnkontroll: Ressurs<ITotrinnkontroll>) => {
                    settTotrinnkontroll(hentetTotrinnkontroll);
                })
                .catch((error: AxiosError) => {
                    console.log('Error ved henting av steg for totrinngskontroll: ', error);
                    settTotrinnkontroll(
                        byggFeiletRessurs(
                            'Ukjent feil ved henting av to-trinnskontroll for behandling'
                        )
                    );
                });
        };

        const oppdaterGodkjenning = (stegIndex: string, verdi: TotrinnGodkjenningOption) => {
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

        const oppdaterBegrunnelse = (stegIndex: string, verdi: string) => {
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

        const validerToTrinn = () => {
            let harFeil = false;
            const nySkjemaData = skjemaData.map(totrinn => {
                let feilmelding;
                let begrunnelseFeilmelding;
                if (!totrinn.godkjent) {
                    feilmelding = `${behandlingssteg[totrinn.behandlingssteg]} må vurderes`;
                }
                if (totrinn.godkjent === OptionIkkeGodkjent) {
                    // @ts-ignore
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

        const sendInnSkjema = () => {
            if (validerToTrinn()) {
                settSenderInn(false);

                const payload: FatteVedtakStegPayload = {
                    '@type': 'FATTE_VEDTAK',
                    // @ts-ignore
                    totrinnsvurderinger: skjemaData.map<TotrinnsStegVurdering>(ttSteg => {
                        const ikkkGodkjent = ttSteg.godkjent === OptionIkkeGodkjent;
                        return {
                            behandlingssteg: ttSteg.behandlingssteg,
                            // @ts-ignore
                            godkjent: ttSteg.godkjent?.verdi,
                            begrunnelse: ikkkGodkjent ? ttSteg.begrunnelse : null,
                        };
                    }),
                };

                sendInnFatteVedtak(behandling.behandlingId, payload)
                    .then((respons: Ressurs<string>) => {
                        settSenderInn(false);
                        if (respons.status === RessursStatus.SUKSESS) {
                            hentBehandlingMedBehandlingId(behandling.behandlingId, true);
                        } else if (
                            respons.status === RessursStatus.FEILET ||
                            respons.status === RessursStatus.FUNKSJONELL_FEIL
                        ) {
                            settFatteVedtakRespons(respons);
                        }
                    })
                    .catch((error: AxiosError) => {
                        console.log('Error ved sending av oppdaterte foreldelse: ', error);
                        settSenderInn(false);
                        settFatteVedtakRespons(
                            byggFeiletRessurs('Ukjent feil ved sending av vedtak')
                        );
                    });
            }
        };

        const navigerTilSide = (side: ISide) => {
            navigate(
                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${side.href}`
            );
        };

        return {
            stegErBehandlet,
            fatteVedtakILåsemodus,
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
        };
    }
);

export { TotrinnskontrollProvider, useTotrinnskontroll };
