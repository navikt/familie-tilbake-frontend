import type { FaktaPeriodeSkjemaData, FaktaSkjemaData, Feilmelding } from './typer/fakta';
import type { HendelseType, HendelseUndertype } from '../../../kodeverk';
import type { FaktaStegPayload, PeriodeFaktaStegPayload } from '../../../typer/api';
import type { Behandling } from '../../../typer/behandling';
import type {
    FaktaResponse,
    VurderingAvBrukersUttalelse,
} from '../../../typer/tilbakekrevingstyper';

import createUseContext from 'constate';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';
import { useRedirectEtterLagring } from '../../../hooks/useRedirectEtterLagring';
import { Behandlingssteg } from '../../../typer/behandling';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    type Ressurs,
    RessursStatus,
} from '../../../typer/ressurs';
import { HarBrukerUttaltSegValg } from '../../../typer/tilbakekrevingstyper';
import {
    DefinertFeilmelding,
    definerteFeilmeldinger,
    sorterFeilutbetaltePerioder,
    validerTekstMaksLengde,
} from '../../../utils';
import { SYNLIGE_STEG } from '../../../utils/sider';

const _validerTekst3000 = validerTekstMaksLengde(3000);

type Props = {
    behandling: Behandling;
};

const [FaktaProvider, useFakta] = createUseContext(({ behandling }: Props) => {
    const { fagsak } = useFagsak();
    const [fakta, setFakta] = useState<Ressurs<FaktaResponse>>();
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
    const { gjerFaktaKall, sendInnFakta } = useBehandlingApi();
    const { utførRedirect } = useRedirectEtterLagring();
    const navigate = useNavigate();

    useEffect(() => {
        if (visVenteModal === false) {
            settStegErBehandlet(erStegBehandlet(Behandlingssteg.Fakta));
            hentFakta();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behandling, visVenteModal]);

    useEffect(() => {
        if (fakta?.status === RessursStatus.Suksess) {
            const data = fakta.data;
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
    }, [fakta]);

    const hentFakta = (): void => {
        setFakta(byggHenterRessurs());
        gjerFaktaKall(behandling.behandlingId)
            .then((hentetFakta: Ressurs<FaktaResponse>) => {
                setFakta(hentetFakta);
            })
            .catch(() => {
                setFakta(
                    byggFeiletRessurs('Ukjent feil ved henting av fakta-perioder for behandling')
                );
            });
    };

    const oppdaterBegrunnelse = (nyBegrunnelse: string): void => {
        settSkjemaData(prevState => {
            return { ...prevState, begrunnelse: nyBegrunnelse };
        });
    };

    const oppdaterBrukerHarUttaltSeg = (harBrukerUttaltSeg: HarBrukerUttaltSegValg): void => {
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

    const oppdaterBeskrivelseBrukerHarUttaltSeg = (begrunnelse: string): void => {
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

    const oppdaterÅrsakPåPeriode = (
        periode: FaktaPeriodeSkjemaData,
        nyÅrsak: HendelseType | undefined
    ): void => {
        if (behandlePerioderSamlet) {
            oppdaterÅrsaker(nyÅrsak);
        } else {
            oppdaterÅrsak(periode, nyÅrsak);
        }
        settIkkePersistertKomponent('fakta');
    };

    const oppdaterUnderårsakPåPeriode = (
        periode: FaktaPeriodeSkjemaData,
        nyUnderårsak: HendelseUndertype | undefined
    ): void => {
        if (behandlePerioderSamlet) {
            oppdaterUnderårsaker(periode, nyUnderårsak);
        } else {
            oppdaterUnderårsak(periode, nyUnderårsak);
        }
        settIkkePersistertKomponent('fakta');
    };

    const oppdaterÅrsaker = (nyÅrsak: HendelseType | undefined): void => {
        const nyePerioder = skjemaData.perioder.map(periode => {
            return { ...periode, hendelsestype: nyÅrsak, hendelsesundertype: undefined };
        });

        settSkjemaData((prevState: FaktaSkjemaData) => {
            return { ...prevState, perioder: nyePerioder };
        });
    };

    const oppdaterÅrsak = (
        periode: FaktaPeriodeSkjemaData,
        nyÅrsak: HendelseType | undefined
    ): void => {
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
        nyUnderårsak: HendelseUndertype | undefined
    ): void => {
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
        nyUnderårsak: HendelseUndertype | undefined
    ): void => {
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
            vurderingAvBrukersUttalelse?.harBrukerUttaltSeg !== HarBrukerUttaltSegValg.IkkeAktuelt
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

    const harEndretOpplysninger = (): boolean => {
        if (fakta?.status === RessursStatus.Suksess) {
            const hentetData = fakta.data;
            return (
                hentetData.vurderingAvBrukersUttalelse !== skjemaData.vurderingAvBrukersUttalelse ||
                hentetData.begrunnelse !== skjemaData.begrunnelse ||
                fakta.data.feilutbetaltePerioder.some(fuPF => {
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

    const sendInnSkjema = (): void => {
        if (stegErBehandlet && !harEndretOpplysninger()) {
            nullstillIkkePersisterteKomponenter();
            utførRedirect(
                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${SYNLIGE_STEG.FORELDELSE.href}`
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
                sendInnFakta(behandling.behandlingId, payload).then((respons: Ressurs<string>) => {
                    settSenderInn(false);
                    if (respons.status === RessursStatus.Suksess) {
                        hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                            navigate(
                                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                            );
                        });
                    }
                });
            }
        }
    };

    const gåTilForrige = (): void => {
        navigate(
            `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${SYNLIGE_STEG.VERGE.href}`
        );
    };

    return {
        behandling,
        stegErBehandlet,
        fakta,
        skjemaData,
        oppdaterBegrunnelse,
        oppdaterBrukerHarUttaltSeg,
        oppdaterBeskrivelseBrukerHarUttaltSeg,
        oppdaterÅrsakPåPeriode,
        oppdaterUnderårsakPåPeriode,
        hentFakta,
        behandlePerioderSamlet,
        settBehandlePerioderSamlet,
        sendInnSkjema,
        visFeilmeldinger,
        feilmeldinger,
        senderInn,
        gåTilForrige,
    };
});

export { FaktaProvider, useFakta };
