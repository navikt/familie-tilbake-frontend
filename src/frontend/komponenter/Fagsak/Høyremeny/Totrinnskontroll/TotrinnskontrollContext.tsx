import { useState, useEffect } from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';
import { useNavigate } from 'react-router-dom';

import { byggFeiletRessurs, byggHenterRessurs } from '@navikt/familie-typer';

import {
    OptionIkkeGodkjent,
    TotrinnGodkjenningOption,
    totrinnGodkjenningOptions,
    TotrinnStegSkjemaData,
} from './typer/totrinnSkjemaTyper';
import { useBehandlingApi } from '../../../../api/behandling';
import { useBehandling } from '../../../../context/BehandlingContext';
import { FatteVedtakStegPayload, TotrinnsStegVurdering } from '../../../../typer/api';
import { behandlingssteg, Behandlingssteg, IBehandling } from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';
import { ITotrinnkontroll } from '../../../../typer/totrinnTyper';
import { hentFrontendFeilmelding, validerTekstMaksLengde } from '../../../../utils';
import { ISide, sider } from '../../../Felleskomponenter/Venstremeny/sider';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';

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
        const [erLesevisning, settErLesevisning] = useState<boolean>(false);
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
        const { gjerTotrinnkontrollKall, sendInnFatteVedtak, kallAngreSendTilBeslutter } =
            useBehandlingApi();
        const navigate = useNavigate();
        const [feilmelding, settFeilmelding] = useState<string>('');
        const [laster, settLaster] = useState(false);

        useEffect(() => {
            if (visVenteModal === false) {
                settStegErBehandlet(erStegBehandlet(Behandlingssteg.FATTE_VEDTAK));
                settErLesevisning(!behandling.kanEndres || erBehandlingReturnertFraBeslutter());
                hentTotrinnkontroll();
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .catch((_error: AxiosError) => {
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

        const angreSendTilBeslutter = () => {
            if (laster) {
                return;
            }
            settLaster(true);
            settFeilmelding('');
            kallAngreSendTilBeslutter(behandling.behandlingId)
                .then((res: Ressurs<string>) => {
                    if (res.status === RessursStatus.SUKSESS) {
                        hentBehandlingMedBehandlingId(behandling.behandlingId);
                    } else {
                        settFeilmelding(
                            hentFrontendFeilmelding(res) ??
                                'Ukjent feil ved angre send til beslutter'
                        );
                    }
                })
                .finally(() => {
                    settLaster(false);
                });
        };

        const sendInnSkjema = () => {
            if (validerToTrinn()) {
                settSenderInn(false);

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
                    .then((respons: Ressurs<string>) => {
                        settSenderInn(false);
                        if (respons.status === RessursStatus.SUKSESS) {
                            hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                                navigate(
                                    `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.VERGE.href}`
                                );
                            });
                        } else if (
                            respons.status === RessursStatus.FEILET ||
                            respons.status === RessursStatus.FUNKSJONELL_FEIL
                        ) {
                            settFatteVedtakRespons(respons);
                        }
                    })
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    .catch((_error: AxiosError) => {
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
    }
);

export { TotrinnskontrollProvider, useTotrinnskontroll };
