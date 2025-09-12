import type { AvsnittSkjemaData, UnderavsnittSkjemaData } from './typer/feilutbetalingVedtak';
import type {
    ForeslåVedtakStegPayload,
    ForhåndsvisVedtaksbrev,
    Fritekstavsnitt,
    PeriodeMedTekst,
} from '../../../typer/api';
import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';
import type { IBeregningsresultat, VedtaksbrevAvsnitt } from '../../../typer/vedtakTyper';
import type { AxiosError } from 'axios';

import createUseContext from 'constate';
import * as React from 'react';
import { useNavigate } from 'react-router';

import { useBehandlingApi } from '../../../api/behandling';
import { useDokumentApi } from '../../../api/dokument';
import { useBehandling } from '../../../context/BehandlingContext';
import { Avsnittstype, Underavsnittstype } from '../../../kodeverk';
import { Behandlingstype, Behandlingårsak } from '../../../typer/behandling';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    type Ressurs,
    RessursStatus,
} from '../../../typer/ressurs';
import { isEmpty, validerTekstMaksLengde } from '../../../utils';
import { SYNLIGE_STEG } from '../../../utils/sider';

const hentPerioderMedTekst = (skjemaData: AvsnittSkjemaData[]): PeriodeMedTekst[] => {
    // @ts-expect-error - klager på periode men er trygt p.g.s. filtreringen
    const perioderMedTekst: PeriodeMedTekst[] = skjemaData
        .filter(
            avs =>
                avs.avsnittstype === Avsnittstype.Periode ||
                avs.avsnittstype === Avsnittstype.SammenslåttPeriode
        )
        .map(avs => {
            const fakta = avs.underavsnittsliste.find(
                uavs => uavs.underavsnittstype === Underavsnittstype.Fakta && uavs.fritekstTillatt
            );
            const foreldelse = avs.underavsnittsliste.find(
                uavs =>
                    uavs.underavsnittstype === Underavsnittstype.Foreldelse && uavs.fritekstTillatt
            );
            const særligeGrunner = avs.underavsnittsliste.find(
                uavs =>
                    uavs.underavsnittstype === Underavsnittstype.Særligegrunner &&
                    uavs.fritekstTillatt
            );
            const sæerligeGrunnerAnnet = avs.underavsnittsliste.find(
                uavs =>
                    uavs.underavsnittstype === Underavsnittstype.SærligegrunnerAnnet &&
                    uavs.fritekstTillatt
            );
            const vilkår = avs.underavsnittsliste.find(
                uavs => uavs.underavsnittstype === Underavsnittstype.Vilkår && uavs.fritekstTillatt
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
        const [feilutbetalingVedtaksbrevavsnitt, settFeilutbetalingVedtaksbrevavsnitt] =
            React.useState<Ressurs<VedtaksbrevAvsnitt[]>>();
        const [beregningsresultat, settBeregningsresultat] =
            React.useState<Ressurs<IBeregningsresultat>>();
        const [skjemaData, settSkjemaData] = React.useState<AvsnittSkjemaData[]>([]);
        const [harPåkrevetFritekstMenIkkeUtfylt, settHarPåkrevetFritekstMenIkkeUtfylt] =
            React.useState<boolean>(false);
        const [disableBekreft, settDisableBekreft] = React.useState<boolean>(true);
        const [nonUsedKey, settNonUsedKey] = React.useState<string>(Date.now().toString());
        const [senderInn, settSenderInn] = React.useState<boolean>(false);
        const [foreslåVedtakRespons, settForeslåVedtakRespons] = React.useState<Ressurs<string>>();
        const {
            visVenteModal,
            hentBehandlingMedBehandlingId,
            nullstillIkkePersisterteKomponenter,
        } = useBehandling();
        const { gjerVedtaksbrevteksterKall, gjerBeregningsresultatKall, sendInnForeslåVedtak } =
            useBehandlingApi();
        const { lagreUtkastVedtaksbrev } = useDokumentApi();
        const navigate = useNavigate();

        React.useEffect(() => {
            if (visVenteModal === false) {
                hentBeregningsresultat();
                hentVedtaksbrevtekster();
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [behandling, visVenteModal]);

        React.useEffect(() => {
            if (feilutbetalingVedtaksbrevavsnitt?.status === RessursStatus.Suksess) {
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
            gjerVedtaksbrevteksterKall(behandling.behandlingId)
                .then((hentetVedtaksbrevavsnitt: Ressurs<VedtaksbrevAvsnitt[]>) => {
                    settFeilutbetalingVedtaksbrevavsnitt(hentetVedtaksbrevavsnitt);
                })
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .catch((_error: AxiosError) => {
                    settFeilutbetalingVedtaksbrevavsnitt(
                        byggFeiletRessurs(
                            'Ukjent feil ved henting av vilkårsvurdering-perioder for behandling'
                        )
                    );
                });
        };

        const hentBeregningsresultat = (): void => {
            settBeregningsresultat(byggHenterRessurs());
            gjerBeregningsresultatKall(behandling.behandlingId)
                .then((hentetBeregningsresultat: Ressurs<IBeregningsresultat>) => {
                    settBeregningsresultat(hentetBeregningsresultat);
                })
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .catch((_error: AxiosError) => {
                    settBeregningsresultat(
                        byggFeiletRessurs(
                            'Ukjent feil ved henting av beregningsresultat for behandling'
                        )
                    );
                });
        };

        const gåTilForrige = (): void => {
            navigate(
                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${SYNLIGE_STEG.VILKÅRSVURDERING.href}`
            );
        };

        const oppdaterUnderavsnitt = (
            avsnittIndex: string,
            oppdatertUnderavsnitt: UnderavsnittSkjemaData
        ): void => {
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

        const validerAlleAvsnittOk = (validerPåkrevetFritekst: boolean): boolean => {
            const erRevurderingBortfaltBeløp =
                behandling.type === Behandlingstype.RevurderingTilbakekreving &&
                behandling.behandlingsårsakstype ===
                    Behandlingårsak.RevurderingFeilutbetaltBeløpHeltEllerDelvisBortfalt;
            let harFeil = false;
            skjemaData.map(avs => {
                const nyeUnderavsnitt = avs.underavsnittsliste.map(uavs => {
                    let uavsFeil = false;
                    let feilmelding = undefined;
                    if (uavs.fritekstPåkrevet && !uavs.fritekst && validerPåkrevetFritekst) {
                        uavsFeil = true;
                        feilmelding = 'Feltet er påkrevet';
                    }
                    if (!uavsFeil && !isEmpty(uavs.fritekst)) {
                        feilmelding = validerTekstMaksLengde(
                            erRevurderingBortfaltBeløp ? 10000 : 4000
                        )(uavs.fritekst as string);
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

        const lagFritekstavsnitt = (): Fritekstavsnitt => {
            const oppsummering = skjemaData.find(
                avs => avs.avsnittstype === Avsnittstype.Oppsummering
            );
            const oppsummeringTekst = oppsummering?.underavsnittsliste.find(
                uavs => uavs.fritekstTillatt
            )?.fritekst;
            const perioderMedTekst: PeriodeMedTekst[] = hentPerioderMedTekst(skjemaData);

            return {
                oppsummeringstekst: oppsummeringTekst,
                perioderMedTekst: perioderMedTekst,
            };
        };

        const sendInnSkjema = (): void => {
            if (!harPåkrevetFritekstMenIkkeUtfylt && validerAlleAvsnittOk(true)) {
                settSenderInn(true);
                settForeslåVedtakRespons(undefined);
                nullstillIkkePersisterteKomponenter();
                const payload: ForeslåVedtakStegPayload = {
                    '@type': 'FORESLÅ_VEDTAK',
                    fritekstavsnitt: lagFritekstavsnitt(),
                };
                sendInnForeslåVedtak(behandling.behandlingId, payload)
                    .then((respons: Ressurs<string>) => {
                        settSenderInn(false);
                        if (respons.status === RessursStatus.Suksess) {
                            hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                                navigate(
                                    `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                                );
                            });
                        } else if (
                            respons.status === RessursStatus.Feilet ||
                            respons.status === RessursStatus.FunksjonellFeil
                        ) {
                            settForeslåVedtakRespons(respons);
                        }
                    })
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    .catch((_error: AxiosError) => {
                        settSenderInn(false);
                        settForeslåVedtakRespons(
                            byggFeiletRessurs('Ukjent feil ved sending av vedtak')
                        );
                    });
            }
        };

        const lagreUtkast = (): void => {
            if (validerAlleAvsnittOk(false)) {
                settSenderInn(true);
                settForeslåVedtakRespons(undefined);
                nullstillIkkePersisterteKomponenter();
                lagreUtkastVedtaksbrev(behandling.behandlingId, lagFritekstavsnitt())
                    .then((respons: Ressurs<string>) => {
                        settSenderInn(false);
                        if (respons.status === RessursStatus.Suksess) {
                            hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                                navigate(
                                    `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                                );
                            });
                        } else if (
                            respons.status === RessursStatus.Feilet ||
                            respons.status === RessursStatus.FunksjonellFeil
                        ) {
                            settForeslåVedtakRespons(respons);
                        }
                    })
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    .catch((_error: AxiosError) => {
                        settSenderInn(false);
                        settForeslåVedtakRespons(
                            byggFeiletRessurs('Ukjent feil ved mellomlagring av vedtak')
                        );
                    });
            }
        };

        const hentBrevdata = (): ForhåndsvisVedtaksbrev => {
            const oppsummering = skjemaData.find(
                avs => avs.avsnittstype === Avsnittstype.Oppsummering
            );
            const oppsummeringTekst = oppsummering?.underavsnittsliste.find(
                uavs => uavs.fritekstTillatt
            )?.fritekst;
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
            validerAlleAvsnittOk,
            lagreUtkast,
            hentVedtaksbrevtekster,
        };
    }
);

export { FeilutbetalingVedtakProvider, useFeilutbetalingVedtak };
