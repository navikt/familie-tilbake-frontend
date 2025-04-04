import type {
    FaktaPeriodeSkjemaData,
    FaktaSkjemaData,
    Feilmelding,
} from './typer/feilutbetalingFakta';
import type { HendelseType, HendelseUndertype } from '../../../kodeverk';
import type { FaktaStegPayload, PeriodeFaktaStegPayload } from '../../../typer/api';
import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';
import type {
    IFeilutbetalingFakta,
    VurderingAvBrukersUttalelse,
} from '../../../typer/feilutbetalingtyper';
import type { AxiosError } from 'axios';

import createUseContext from 'constate';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { useRedirectEtterLagring } from '../../../hooks/useRedirectEtterLagring';
import { Behandlingssteg } from '../../../typer/behandling';
import { HarBrukerUttaltSegValg } from '../../../typer/feilutbetalingtyper';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    type Ressurs,
    RessursStatus,
} from '../../../typer/ressurs';
import {
    DefinertFeilmelding,
    definerteFeilmeldinger,
    sorterFeilutbetaltePerioder,
    validerTekstMaksLengde,
} from '../../../utils';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';

const _validerTekst3000 = validerTekstMaksLengde(3000);

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
}

const [FeilutbetalingFaktaProvider, useFeilutbetalingFakta] = createUseContext(
    ({ behandling, fagsak }: IProps) => {
        const [feilutbetalingFakta, settFeilutbetalingFakta] =
            useState<Ressurs<IFeilutbetalingFakta>>();
        const [skjemaData, settSkjemaData] = useState<FaktaSkjemaData>({
            perioder: [],
            vurderingAvBrukersUttalelse: {
                harBrukerUttaltSeg: HarBrukerUttaltSegValg.IkkeVurdert,
            },
        });
        const [behandlePerioderSamlet, settBehandlePerioderSamlet] = useState<boolean>(false);
        const [stegErBehandlet, settStegErBehandlet] = useState<boolean>(false);
        const [visFeilmeldinger, settVisFeilmeldinger] = useState<boolean>(false);
        const [senderInn, settSenderInn] = useState<boolean>(false);
        const [feilmeldinger, settFeilmeldinger] = useState<Feilmelding[]>();
        const {
            erStegBehandlet,
            visVenteModal,
            settIkkePersistertKomponent,
            nullstillIkkePersisterteKomponenter,
            hentBehandlingMedBehandlingId,
        } = useBehandling();
        const { gjerFeilutbetalingFaktaKall, sendInnFeilutbetalingFakta } = useBehandlingApi();
        const { utførRedirect } = useRedirectEtterLagring();
        const navigate = useNavigate();

        useEffect(() => {
            if (visVenteModal === false) {
                settStegErBehandlet(erStegBehandlet(Behandlingssteg.Fakta));
                hentFeilutbetalingFakta();
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [behandling, visVenteModal]);

        useEffect(() => {
            if (feilutbetalingFakta?.status === RessursStatus.Suksess) {
                const data = feilutbetalingFakta.data;
                const sortertePerioder = sorterFeilutbetaltePerioder(data.feilutbetaltePerioder);
                const behandletPerioder = sortertePerioder.map((fuFP, index) => {
                    const behandletPeriode: FaktaPeriodeSkjemaData = {
                        index,
                        feilutbetaltBeløp: fuFP.feilutbetaltBeløp,
                        periode: fuFP.periode,
                        hendelsestype: fuFP.hendelsestype || undefined,
                        hendelsesundertype: fuFP.hendelsesundertype || undefined,
                    };
                    return behandletPeriode;
                });

                settSkjemaData({
                    begrunnelse: data.begrunnelse || undefined,
                    perioder: behandletPerioder,
                    vurderingAvBrukersUttalelse: data.vurderingAvBrukersUttalelse,
                });
            }
        }, [feilutbetalingFakta]);

        const hentFeilutbetalingFakta = (): void => {
            settFeilutbetalingFakta(byggHenterRessurs());
            gjerFeilutbetalingFaktaKall(behandling.behandlingId)
                .then((hentetFakta: Ressurs<IFeilutbetalingFakta>) => {
                    settFeilutbetalingFakta(hentetFakta);
                })
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .catch((_error: AxiosError) => {
                    settFeilutbetalingFakta(
                        byggFeiletRessurs(
                            'Ukjent feil ved henting av fakta-perioder for behandling'
                        )
                    );
                });
        };

        const oppdaterBegrunnelse = (nyBegrunnelse: string) => {
            settSkjemaData(prevState => {
                return { ...prevState, begrunnelse: nyBegrunnelse };
            });
        };

        const oppdaterBrukerHarUttaltSeg = (harBrukerUttaltSeg: HarBrukerUttaltSegValg) => {
            settSkjemaData(prevState => {
                return {
                    ...prevState,
                    vurderingAvBrukersUttalelse: {
                        ...prevState.vurderingAvBrukersUttalelse,
                        harBrukerUttaltSeg: harBrukerUttaltSeg,
                    },
                };
            });
        };

        const oppdaterBeskrivelseBrukerHarUttaltSeg = (begrunnelse: string) => {
            settSkjemaData(prevState => {
                return {
                    ...prevState,
                    vurderingAvBrukersUttalelse: {
                        harBrukerUttaltSeg:
                            prevState.vurderingAvBrukersUttalelse?.harBrukerUttaltSeg ||
                            HarBrukerUttaltSegValg.IkkeVurdert,
                        beskrivelse: begrunnelse,
                    },
                };
            });
        };

        const oppdaterÅrsakPåPeriode = (periode: FaktaPeriodeSkjemaData, nyÅrsak: HendelseType) => {
            if (behandlePerioderSamlet) {
                oppdaterÅrsaker(nyÅrsak);
            } else {
                oppdaterÅrsak(periode, nyÅrsak);
            }
            settIkkePersistertKomponent('fakta');
        };

        const oppdaterUnderårsakPåPeriode = (
            periode: FaktaPeriodeSkjemaData,
            nyUnderårsak: HendelseUndertype
        ) => {
            if (behandlePerioderSamlet) {
                oppdaterUnderårsaker(periode, nyUnderårsak);
            } else {
                oppdaterUnderårsak(periode, nyUnderårsak);
            }
            settIkkePersistertKomponent('fakta');
        };

        const oppdaterÅrsaker = (nyÅrsak: HendelseType) => {
            const nyePerioder = skjemaData.perioder.map(periode => {
                return { ...periode, hendelsestype: nyÅrsak, hendelsesundertype: undefined };
            });

            settSkjemaData((prevState: FaktaSkjemaData) => {
                return { ...prevState, perioder: nyePerioder };
            });
        };

        const oppdaterÅrsak = (periode: FaktaPeriodeSkjemaData, nyÅrsak: HendelseType) => {
            const gammelPeriodeIndex = skjemaData.perioder.findIndex(
                gammelPeriode => gammelPeriode.index === periode.index
            );
            const nyPeriode = { ...periode, hendelsestype: nyÅrsak, hendelsesundertype: undefined };
            const nyePerioder = skjemaData.perioder.toSpliced(gammelPeriodeIndex, 1, nyPeriode);

            settSkjemaData((prevState: FaktaSkjemaData) => {
                return { ...prevState, perioder: nyePerioder };
            });
        };

        const oppdaterUnderårsaker = (
            periode: FaktaPeriodeSkjemaData,
            nyUnderårsak: HendelseUndertype
        ) => {
            const nyePerioder = skjemaData.perioder.map(gammelPeriode => {
                if (gammelPeriode.hendelsestype === periode.hendelsestype) {
                    return { ...gammelPeriode, hendelsesundertype: nyUnderårsak };
                }
                return gammelPeriode;
            });

            settSkjemaData((prevState: FaktaSkjemaData) => {
                return { ...prevState, perioder: nyePerioder };
            });
        };

        const oppdaterUnderårsak = (
            periode: FaktaPeriodeSkjemaData,
            nyUnderårsak: HendelseUndertype
        ) => {
            const gammelPeriodeIndex = skjemaData.perioder.findIndex(
                gammelPeriode => gammelPeriode.index === periode.index
            );
            const nyPeriode = { ...periode, hendelsesundertype: nyUnderårsak };
            const nyePerioder = skjemaData.perioder.toSpliced(gammelPeriodeIndex, 1, nyPeriode);

            settSkjemaData((prevState: FaktaSkjemaData) => {
                return { ...prevState, perioder: nyePerioder };
            });
        };

        const validerForInnsending = (): Feilmelding[] => {
            const feilmeldinger: Feilmelding[] = [];
            const vurderingAvBrukersUttalelse = skjemaData.vurderingAvBrukersUttalelse;

            //@ts-expect-error støtter egentlig undefined
            const feilmelding = _validerTekst3000(skjemaData.begrunnelse);
            if (feilmelding) {
                feilmeldinger.push({
                    gjelderBegrunnelse: true,
                    melding: feilmelding,
                });
            }
            if (vurderingAvBrukersUttalelse?.harBrukerUttaltSeg === HarBrukerUttaltSegValg.Ja) {
                const feilmeldingBeskrivelseBrukerHarUttaltSeg = _validerTekst3000(
                    //@ts-expect-error støtter egentlig undefined
                    vurderingAvBrukersUttalelse?.beskrivelse
                );
                if (feilmeldingBeskrivelseBrukerHarUttaltSeg) {
                    feilmeldinger.push({
                        gjelderBeskrivelseBrukerHarUttaltSeg: true,
                        gjelderBegrunnelse: false,
                        melding: feilmeldingBeskrivelseBrukerHarUttaltSeg,
                    });
                }
            }
            if (
                vurderingAvBrukersUttalelse?.harBrukerUttaltSeg !== HarBrukerUttaltSegValg.Nei &&
                vurderingAvBrukersUttalelse?.harBrukerUttaltSeg !== HarBrukerUttaltSegValg.Ja &&
                vurderingAvBrukersUttalelse?.harBrukerUttaltSeg !==
                    HarBrukerUttaltSegValg.IkkeAktuelt
            ) {
                feilmeldinger.push({
                    gjelderBegrunnelse: false,
                    gjelderBrukerHarUttaltSeg: true,
                    melding: definerteFeilmeldinger[DefinertFeilmelding.ObligatoriskFelt],
                });
            }
            for (const periode of skjemaData.perioder) {
                const tomHendelsetype = !periode.hendelsestype;
                const tomHendelseundertype = !periode.hendelsesundertype;
                if (tomHendelsetype || tomHendelseundertype) {
                    feilmeldinger.push({
                        gjelderBegrunnelse: false,
                        periode: periode.index,
                        gjelderHendelsetype: tomHendelsetype,
                        gjelderHendelseundertype: tomHendelseundertype,
                        melding: definerteFeilmeldinger[DefinertFeilmelding.ObligatoriskFelt],
                    });
                }
            }
            return feilmeldinger;
        };

        const harEndretOpplysninger = () => {
            if (feilutbetalingFakta?.status === RessursStatus.Suksess) {
                const hentetData = feilutbetalingFakta.data;
                return (
                    hentetData.vurderingAvBrukersUttalelse !==
                        skjemaData.vurderingAvBrukersUttalelse ||
                    hentetData.begrunnelse !== skjemaData.begrunnelse ||
                    feilutbetalingFakta.data.feilutbetaltePerioder.some(fuPF => {
                        const periode = skjemaData.perioder.find(
                            per =>
                                per.periode.fom === fuPF.periode.fom &&
                                per.periode.tom === fuPF.periode.tom
                        );
                        return (
                            fuPF.hendelsestype !== periode?.hendelsestype ||
                            fuPF.hendelsesundertype !== periode?.hendelsesundertype
                        );
                    })
                );
            }
            return false;
        };

        const gyldigVurderingAvBrukersUttalelse = (
            vurderingAvBrukersUttalelse: VurderingAvBrukersUttalelse
        ): VurderingAvBrukersUttalelse => {
            switch (vurderingAvBrukersUttalelse.harBrukerUttaltSeg) {
                case HarBrukerUttaltSegValg.Ja:
                    return vurderingAvBrukersUttalelse;
                case HarBrukerUttaltSegValg.IkkeVurdert:
                case HarBrukerUttaltSegValg.Nei:
                case HarBrukerUttaltSegValg.IkkeAktuelt:
                    return {
                        harBrukerUttaltSeg: vurderingAvBrukersUttalelse.harBrukerUttaltSeg,
                    };
            }
        };

        const sendInnSkjema = () => {
            if (stegErBehandlet && !harEndretOpplysninger()) {
                nullstillIkkePersisterteKomponenter();
                utførRedirect(
                    `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.FORELDELSE.href}`
                );
            } else {
                const feilmeldinger = validerForInnsending();
                if (feilmeldinger.length > 0) {
                    settVisFeilmeldinger(true);
                    settFeilmeldinger(feilmeldinger);
                } else {
                    settVisFeilmeldinger(false);
                    settSenderInn(true);
                    nullstillIkkePersisterteKomponenter();
                    const payload: FaktaStegPayload = {
                        '@type': 'FAKTA',
                        //@ts-expect-error er satt her
                        begrunnelse: skjemaData.begrunnelse,
                        vurderingAvBrukersUttalelse: gyldigVurderingAvBrukersUttalelse(
                            skjemaData.vurderingAvBrukersUttalelse
                        ),
                        feilutbetaltePerioder: skjemaData.perioder.map<PeriodeFaktaStegPayload>(
                            per => ({
                                periode: per.periode,
                                //@ts-expect-error er satt her
                                hendelsestype: per.hendelsestype,
                                //@ts-expect-error er satt her
                                hendelsesundertype: per.hendelsesundertype,
                            })
                        ),
                    };
                    sendInnFeilutbetalingFakta(behandling.behandlingId, payload).then(
                        (respons: Ressurs<string>) => {
                            settSenderInn(false);
                            if (respons.status === RessursStatus.Suksess) {
                                hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                                    navigate(
                                        `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                                    );
                                });
                            }
                        }
                    );
                }
            }
        };

        const gåTilForrige = () => {
            navigate(
                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.VERGE.href}`
            );
        };

        return {
            behandling,
            stegErBehandlet,
            feilutbetalingFakta,
            skjemaData,
            oppdaterBegrunnelse,
            oppdaterBrukerHarUttaltSeg,
            oppdaterBeskrivelseBrukerHarUttaltSeg,
            oppdaterÅrsakPåPeriode,
            oppdaterUnderårsakPåPeriode,
            hentFeilutbetalingFakta,
            behandlePerioderSamlet,
            settBehandlePerioderSamlet,
            sendInnSkjema,
            visFeilmeldinger,
            feilmeldinger,
            senderInn,
            gåTilForrige,
            fagsak,
        };
    }
);

export { FeilutbetalingFaktaProvider, useFeilutbetalingFakta };
