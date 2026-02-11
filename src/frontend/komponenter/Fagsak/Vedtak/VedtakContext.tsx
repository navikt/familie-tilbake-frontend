import type { AvsnittSkjemaData, UnderavsnittSkjemaData } from './typer/vedtak';
import type {
    ForeslåVedtakStegPayload,
    ForhåndsvisVedtaksbrev,
    Fritekstavsnitt,
    PeriodeMedTekst,
} from '../../../typer/api';
import type { Beregningsresultat, VedtaksbrevAvsnitt } from '../../../typer/vedtakTyper';

import { useQueryClient } from '@tanstack/react-query';
import createUseContext from 'constate';
import * as React from 'react';
import { useState } from 'react';

import { useBehandlingApi } from '../../../api/behandling';
import { useDokumentApi } from '../../../api/dokument';
import { useBehandling } from '../../../context/BehandlingContext';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { hentBehandlingQueryKey } from '../../../generated/@tanstack/react-query.gen';
import { Avsnittstype, Underavsnittstype } from '../../../kodeverk';
import { Behandlingssteg } from '../../../typer/behandling';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    type Ressurs,
    RessursStatus,
} from '../../../typer/ressurs';
import { isEmpty, validerTekstMaksLengde } from '../../../utils';
import { useStegNavigering } from '../../../utils/sider';

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

const [VedtakProvider, useVedtak] = createUseContext(() => {
    const behandling = useBehandling();
    const { nullstillIkkePersisterteKomponenter } = useBehandlingState();
    const [vedtaksbrevavsnitt, setVedtaksbrevavsnitt] = useState<Ressurs<VedtaksbrevAvsnitt[]>>();
    const [beregningsresultat, settBeregningsresultat] = useState<Ressurs<Beregningsresultat>>();
    const [skjemaData, settSkjemaData] = useState<AvsnittSkjemaData[]>([]);
    const [harPåkrevetFritekstMenIkkeUtfylt, settHarPåkrevetFritekstMenIkkeUtfylt] =
        useState<boolean>(false);
    const [disableBekreft, settDisableBekreft] = useState<boolean>(true);
    const [nonUsedKey, settNonUsedKey] = useState<string>(Date.now().toString());
    const [senderInn, settSenderInn] = useState<boolean>(false);
    const [foreslåVedtakRespons, settForeslåVedtakRespons] = useState<Ressurs<string>>();
    const [vedtakSendtTilGodkjenning, settVedtakSendtTilGodkjenning] = useState<boolean>(false);
    const queryClient = useQueryClient();
    const { gjerVedtaksbrevteksterKall, gjerBeregningsresultatKall, sendInnForeslåVedtak } =
        useBehandlingApi();
    const { lagreUtkastVedtaksbrev } = useDokumentApi();

    React.useEffect(() => {
        hentBeregningsresultat();
        hentVedtaksbrevtekster();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behandling]);

    React.useEffect(() => {
        if (vedtaksbrevavsnitt?.status === RessursStatus.Suksess) {
            const avsnitter = vedtaksbrevavsnitt.data;
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
    }, [vedtaksbrevavsnitt]);

    React.useEffect(() => {
        const påkrevetIkkeUtfylt = skjemaData.some(avs =>
            avs.underavsnittsliste.some(uavs => !!uavs.fritekstPåkrevet && isEmpty(uavs.fritekst))
        );
        settHarPåkrevetFritekstMenIkkeUtfylt(påkrevetIkkeUtfylt);
        settDisableBekreft(påkrevetIkkeUtfylt);
    }, [skjemaData, nonUsedKey]);

    const hentVedtaksbrevtekster = (): void => {
        setVedtaksbrevavsnitt(byggHenterRessurs());
        gjerVedtaksbrevteksterKall(behandling.behandlingId)
            .then((hentetVedtaksbrevavsnitt: Ressurs<VedtaksbrevAvsnitt[]>) => {
                setVedtaksbrevavsnitt(hentetVedtaksbrevavsnitt);
            })
            .catch(() => {
                setVedtaksbrevavsnitt(
                    byggFeiletRessurs(
                        'Ukjent feil ved henting av vilkårsvurdering-perioder for behandling'
                    )
                );
            });
    };

    const hentBeregningsresultat = (): void => {
        settBeregningsresultat(byggHenterRessurs());
        gjerBeregningsresultatKall(behandling.behandlingId)
            .then((hentetBeregningsresultat: Ressurs<Beregningsresultat>) => {
                settBeregningsresultat(hentetBeregningsresultat);
            })
            .catch(() => {
                settBeregningsresultat(
                    byggFeiletRessurs(
                        'Ukjent feil ved henting av beregningsresultat for behandling'
                    )
                );
            });
    };
    const navigerTilBehandling = useStegNavigering();
    const navigerTilForrige = useStegNavigering(Behandlingssteg.Vilkårsvurdering);

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
            behandling.type === 'REVURDERING_TILBAKEKREVING' &&
            behandling.behandlingsårsakstype ===
                'REVURDERING_FEILUTBETALT_BELØP_HELT_ELLER_DELVIS_BORTFALT';
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
                    feilmelding = validerTekstMaksLengde(erRevurderingBortfaltBeløp ? 10000 : 4000)(
                        uavs.fritekst as string
                    );
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
        const oppsummering = skjemaData.find(avs => avs.avsnittstype === Avsnittstype.Oppsummering);
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
            settVedtakSendtTilGodkjenning(false);
            nullstillIkkePersisterteKomponenter();
            const payload: ForeslåVedtakStegPayload = {
                '@type': 'FORESLÅ_VEDTAK',
                fritekstavsnitt: lagFritekstavsnitt(),
            };
            sendInnForeslåVedtak(behandling.behandlingId, payload)
                .then(async (respons: Ressurs<string>) => {
                    settSenderInn(false);
                    if (respons.status === RessursStatus.Suksess) {
                        await queryClient.invalidateQueries({
                            queryKey: hentBehandlingQueryKey({
                                path: { behandlingId: behandling.behandlingId },
                            }),
                        });
                        settVedtakSendtTilGodkjenning(true);
                    } else if (
                        respons.status === RessursStatus.Feilet ||
                        respons.status === RessursStatus.FunksjonellFeil
                    ) {
                        settForeslåVedtakRespons(respons);
                    }
                })
                .catch(() => {
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
                .then(async (respons: Ressurs<string>) => {
                    settSenderInn(false);
                    if (respons.status === RessursStatus.Suksess) {
                        await queryClient.invalidateQueries({
                            queryKey: hentBehandlingQueryKey({
                                path: { behandlingId: behandling.behandlingId },
                            }),
                        });
                        navigerTilBehandling();
                    } else if (
                        respons.status === RessursStatus.Feilet ||
                        respons.status === RessursStatus.FunksjonellFeil
                    ) {
                        settForeslåVedtakRespons(respons);
                    }
                })
                .catch(() => {
                    settSenderInn(false);
                    settForeslåVedtakRespons(
                        byggFeiletRessurs('Ukjent feil ved mellomlagring av vedtak')
                    );
                });
        }
    };

    const hentBrevdata = (): ForhåndsvisVedtaksbrev => {
        const oppsummering = skjemaData.find(avs => avs.avsnittstype === Avsnittstype.Oppsummering);
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
        vedtaksbrevavsnitt,
        beregningsresultat,
        skjemaData,
        harPåkrevetFritekstMenIkkeUtfylt,
        nonUsedKey,
        oppdaterUnderavsnitt,
        navigerTilForrige,
        senderInn,
        disableBekreft,
        sendInnSkjema,
        hentBrevdata,
        foreslåVedtakRespons,
        validerAlleAvsnittOk,
        lagreUtkast,
        hentVedtaksbrevtekster,
        vedtakSendtTilGodkjenning,
        nullstillVedtakSendtTilGodkjenning: (): void => settVedtakSendtTilGodkjenning(false),
    };
});

export { VedtakProvider, useVedtak };
