import * as React from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';
import { useHistory } from 'react-router';

import { useHttp } from '@navikt/familie-http';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    Ressurs,
    RessursStatus,
} from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { Avsnittstype, Underavsnittstype } from '../../../kodeverk';
import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import { IBeregningsresultat, VedtaksbrevAvsnitt } from '../../../typer/vedtakTyper';
import { isEmpty, hasValidText } from '../../../utils';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';
import {
    AvsnittSkjemaData,
    ForeslåVedtakStegPayload,
    ForhåndsvisVedtaksbrev,
    PeriodeMedTekst,
    UnderavsnittSkjemaData,
} from './typer/feilutbetalingVedtak';

const hentPerioderMedTekst = (skjemaData: AvsnittSkjemaData[]): PeriodeMedTekst[] => {
    // @ts-ignore - klager på periode men er trygt p.g.s. filtreringen
    const perioderMedTekst: PeriodeMedTekst[] = skjemaData
        .filter(avs => avs.avsnittstype === Avsnittstype.PERIODE)
        .map(avs => {
            const fakta = avs.underavsnittsliste.find(
                uavs => uavs.underavsnittstype === Underavsnittstype.FAKTA
            );
            const foreldelse = avs.underavsnittsliste.find(
                uavs => uavs.underavsnittstype === Underavsnittstype.FORELDELSE
            );
            const særligeGrunner = avs.underavsnittsliste.find(
                uavs => uavs.underavsnittstype === Underavsnittstype.SÆRLIGEGRUNNER
            );
            const sæerligeGrunnerAnnet = avs.underavsnittsliste.find(
                uavs => uavs.underavsnittstype === Underavsnittstype.SÆRLIGEGRUNNER_ANNET
            );
            const vilkår = avs.underavsnittsliste.find(
                uavs => uavs.underavsnittstype === Underavsnittstype.VILKÅR
            );

            return {
                periode: {
                    fom: avs.fom,
                    tom: avs.tom,
                },
                faktaAvsnitt: fakta && !!fakta.fritekst ? fakta.fritekst : undefined,
                foreldelseAvsnitt:
                    foreldelse && !!foreldelse.fritekst ? foreldelse.fritekst : undefined,
                særligeGrunnerAvsnitt:
                    særligeGrunner && !!særligeGrunner.fritekst
                        ? særligeGrunner.fritekst
                        : undefined,
                særligeGrunnerAnnetAvsnitt:
                    sæerligeGrunnerAnnet && !!sæerligeGrunnerAnnet.fritekst
                        ? sæerligeGrunnerAnnet.fritekst
                        : undefined,
                vilkårAvsnitt: vilkår && !!vilkår.fritekst ? vilkår.fritekst : undefined,
            };
        });
    return perioderMedTekst;
};

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
}

const [FeilutbetalingVedtakProvider, useFeilutbetalingVedtak] = createUseContext(
    ({ fagsak, behandling }: IProps) => {
        const [
            feilutbetalingVedtaksbrevavsnitt,
            settFeilutbetalingVedtaksbrevavsnitt,
        ] = React.useState<Ressurs<VedtaksbrevAvsnitt[]>>();
        const [beregningsresultat, settBeregningsresultat] = React.useState<
            Ressurs<IBeregningsresultat>
        >();
        const [skjemaData, settSkjemaData] = React.useState<AvsnittSkjemaData[]>([]);
        const [
            harPåkrevetFritekstMenIkkeUtfylt,
            settHarPåkrevetFritekstMenIkkeUtfylt,
        ] = React.useState<boolean>(false);
        const [disableBekreft, settDisableBekreft] = React.useState<boolean>(true);
        const [nonUsedKey, settNonUsedKey] = React.useState<string>(Date.now().toString());
        const [senderInn, settSenderInn] = React.useState<boolean>(false);
        const [foreslåVedtakRespons, settForeslåVedtakRespons] = React.useState<Ressurs<string>>();
        const { visVenteModal, hentBehandlingMedBehandlingId } = useBehandling();
        const { request } = useHttp();
        const history = useHistory();

        React.useEffect(() => {
            if (visVenteModal === false) {
                hentBeregningsresultat();
                hentVedtaksbrevtekster();
            }
        }, [behandling, visVenteModal]);

        React.useEffect(() => {
            if (feilutbetalingVedtaksbrevavsnitt?.status === RessursStatus.SUKSESS) {
                const avsnitter = feilutbetalingVedtaksbrevavsnitt.data;
                const skjemaAvsnitter = avsnitter.map<AvsnittSkjemaData>((avsnitt, index) => {
                    const skjemaAvsnitt: AvsnittSkjemaData = {
                        index: `idx_avsnitt_${index}`,
                        avsnittstype: avsnitt.avsnittstype,
                        fom: avsnitt.fom,
                        tom: avsnitt.tom,
                        overskrift: avsnitt.overskrift,
                        underavsnittsliste: avsnitt.underavsnittsliste.map<UnderavsnittSkjemaData>(
                            (underavsnitt, uaIndex) => {
                                return {
                                    index: `idx_underavsnitt_${uaIndex}`,
                                    ...underavsnitt,
                                };
                            }
                        ),
                    };
                    return skjemaAvsnitt;
                });
                settSkjemaData(skjemaAvsnitter);
            }
        }, [feilutbetalingVedtaksbrevavsnitt]);

        React.useEffect(() => {
            const påkrevetIkkeUtfylt = skjemaData.some(avs =>
                avs.underavsnittsliste.some(
                    uavs => !!uavs.fritekstPåkrevet && isEmpty(uavs.fritekst)
                )
            );
            settHarPåkrevetFritekstMenIkkeUtfylt(påkrevetIkkeUtfylt);
            settDisableBekreft(påkrevetIkkeUtfylt);
        }, [skjemaData, nonUsedKey]);

        const hentVedtaksbrevtekster = (): void => {
            settFeilutbetalingVedtaksbrevavsnitt(byggHenterRessurs());
            request<void, VedtaksbrevAvsnitt[]>({
                method: 'GET',
                url: `/familie-tilbake/api/dokument/vedtaksbrevtekst/${behandling.behandlingId}`,
            })
                .then((hentetVedtaksbrevavsnitt: Ressurs<VedtaksbrevAvsnitt[]>) => {
                    settFeilutbetalingVedtaksbrevavsnitt(hentetVedtaksbrevavsnitt);
                })
                .catch((error: AxiosError) => {
                    console.log('Error ved henting av vilkårsvurdering: ', error);
                    settFeilutbetalingVedtaksbrevavsnitt(
                        byggFeiletRessurs(
                            'Ukjent feil ved henting av vilkårsvurdering-perioder for behandling'
                        )
                    );
                });
        };

        const hentBeregningsresultat = (): void => {
            settBeregningsresultat(byggHenterRessurs());
            request<void, IBeregningsresultat>({
                method: 'GET',
                url: `/familie-tilbake/api/behandling/${behandling.behandlingId}/beregn/resultat/v1`,
            })
                .then((hentetBeregningsresultat: Ressurs<IBeregningsresultat>) => {
                    settBeregningsresultat(hentetBeregningsresultat);
                })
                .catch((error: AxiosError) => {
                    console.log('Error ved henting av beregningsresultat: ', error);
                    settBeregningsresultat(
                        byggFeiletRessurs(
                            'Ukjent feil ved henting av beregningsresultat for behandling'
                        )
                    );
                });
        };

        const gåTilForrige = () => {
            history.push(
                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.VILKÅRSVURDERING.href}`
            );
        };

        const oppdaterUnderavsnitt = (
            avsnittIndex: string,
            oppdatertUnderavsnitt: UnderavsnittSkjemaData
        ) => {
            const avsnitter = skjemaData;
            const avsIndex = avsnitter.findIndex(avs => avs.index === avsnittIndex);
            const avsnitt = avsnitter.find(avs => avs.index === avsnittIndex);
            if (avsnitt) {
                const underavsnitter = avsnitt.underavsnittsliste;
                const uavsIndex = underavsnitter.findIndex(
                    uavs => uavs.index === oppdatertUnderavsnitt.index
                );
                underavsnitter.splice(uavsIndex, 1, oppdatertUnderavsnitt);
                avsnitt.underavsnittsliste = underavsnitter;
                avsnitter.splice(avsIndex, 1, avsnitt);
                settSkjemaData(avsnitter);
                settNonUsedKey(Date.now().toString());
            }
        };

        const validerAlleAvsnittOk = () => {
            let harFeil = false;
            skjemaData.map(avs => {
                const nyeUnderavsnitt = avs.underavsnittsliste.map(uavs => {
                    let uavsFeil = false;
                    let feilmelding = undefined;
                    if (uavs.fritekstPåkrevet && !uavs.fritekst) {
                        uavsFeil = true;
                        feilmelding = 'Feltet er påkrevet';
                    }
                    if (!uavsFeil && !isEmpty(uavs.fritekst)) {
                        // @ts-ignore
                        feilmelding = hasValidText(uavs.fritekst);
                        uavsFeil = !!feilmelding;
                    }

                    harFeil = harFeil || uavsFeil;
                    return {
                        ...uavs,
                        harFeil: uavsFeil,
                        feilmelding: feilmelding,
                    };
                });

                return {
                    ...avs,
                    underavsnittsliste: nyeUnderavsnitt,
                };
            });
            return !harFeil;
        };

        const sendInnSkjema = () => {
            if (!harPåkrevetFritekstMenIkkeUtfylt && validerAlleAvsnittOk()) {
                settSenderInn(true);
                settForeslåVedtakRespons(undefined);
                const oppsummering = skjemaData.find(
                    avs => avs.avsnittstype === Avsnittstype.OPPSUMMERING
                );
                const oppsummeringTekst = oppsummering?.underavsnittsliste[0].fritekst;
                const perioderMedTekst: PeriodeMedTekst[] = hentPerioderMedTekst(skjemaData);

                const payload: ForeslåVedtakStegPayload = {
                    '@type': 'FORESLÅ_VEDTAK',
                    fritekstavsnitt: {
                        oppsummeringstekst: oppsummeringTekst,
                        perioderMedTekst: perioderMedTekst,
                    },
                };
                request<ForeslåVedtakStegPayload, string>({
                    method: 'POST',
                    url: `/familie-tilbake/api/behandling/${behandling.behandlingId}/steg/v1`,
                    data: payload,
                })
                    .then((respons: Ressurs<string>) => {
                        settSenderInn(false);
                        if (respons.status === RessursStatus.SUKSESS) {
                            hentBehandlingMedBehandlingId(behandling.behandlingId, true);
                        } else if (
                            respons.status === RessursStatus.FEILET ||
                            respons.status === RessursStatus.FUNKSJONELL_FEIL
                        ) {
                            settForeslåVedtakRespons(respons);
                        }
                    })
                    .catch((error: AxiosError) => {
                        console.log('Error ved sending av oppdaterte foreldelse: ', error);
                        settSenderInn(false);
                        settForeslåVedtakRespons(
                            byggFeiletRessurs('Ukjent feil ved sending av vedtak')
                        );
                    });
            }
        };

        const hentBrevdata = (): ForhåndsvisVedtaksbrev => {
            const oppsummering = skjemaData.find(
                avs => avs.avsnittstype === Avsnittstype.OPPSUMMERING
            );
            const oppsummeringTekst = oppsummering?.underavsnittsliste[0].fritekst;
            const perioderMedTekst: PeriodeMedTekst[] = hentPerioderMedTekst(skjemaData);
            return {
                behandlingId: behandling.behandlingId,
                oppsummeringstekst: oppsummeringTekst,
                perioderMedTekst: perioderMedTekst,
            };
        };

        return {
            feilutbetalingVedtaksbrevavsnitt,
            beregningsresultat,
            skjemaData,
            harPåkrevetFritekstMenIkkeUtfylt,
            nonUsedKey,
            oppdaterUnderavsnitt,
            gåTilForrige,
            senderInn,
            disableBekreft,
            sendInnSkjema,
            hentBrevdata,
            foreslåVedtakRespons,
        };
    }
);

export { FeilutbetalingVedtakProvider, useFeilutbetalingVedtak };
