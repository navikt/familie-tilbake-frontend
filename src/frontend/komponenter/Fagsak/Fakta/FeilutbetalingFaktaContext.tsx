import React from 'react';

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
import { HendelseType, HendelseUndertype } from '../../../kodeverk';
import { Behandlingssteg, IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import { IFeilutbetalingFakta } from '../../../typer/feilutbetalingtyper';
import {
    sorterFeilutbetaltePerioder,
    validerTekst,
    definerteFeilmeldinger,
    DEFINERT_FEILMELDING,
} from '../../../utils';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';
import {
    FaktaPeriodeSkjemaData,
    FaktaSkjemaData,
    FaktaStegPayload,
    Feilmelding,
    PeriodeFaktaStegPayload,
} from './typer/feilutbetalingFakta';

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
}

const [FeilutbetalingFaktaProvider, useFeilutbetalingFakta] = createUseContext(
    ({ behandling, fagsak }: IProps) => {
        const [feilutbetalingFakta, settFeilutbetalingFakta] = React.useState<
            Ressurs<IFeilutbetalingFakta>
        >();
        const [skjemaData, settSkjemaData] = React.useState<FaktaSkjemaData>({ perioder: [] });
        const [behandlePerioderSamlet, settBehandlePerioderSamlet] = React.useState<boolean>(false);
        const [stegErBehandlet, settStegErBehandlet] = React.useState<boolean>(false);
        const [visFeilmeldinger, settVisFeilmeldinger] = React.useState<boolean>(false);
        const [senderInn, settSenderInn] = React.useState<boolean>(false);
        const [feilmeldinger, settFeilmeldinger] = React.useState<Feilmelding[]>();
        const { erStegBehandlet, visVenteModal, hentBehandlingMedBehandlingId } = useBehandling();
        const { request } = useHttp();
        const history = useHistory();

        React.useEffect(() => {
            if (visVenteModal === false) {
                settStegErBehandlet(erStegBehandlet(Behandlingssteg.FAKTA));
                hentFeilutbetalingFakta();
            }
        }, [behandling, visVenteModal]);

        React.useEffect(() => {
            if (feilutbetalingFakta?.status === RessursStatus.SUKSESS) {
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
                });
            }
        }, [feilutbetalingFakta]);

        const hentFeilutbetalingFakta = (): void => {
            settFeilutbetalingFakta(byggHenterRessurs());
            request<void, IFeilutbetalingFakta>({
                method: 'GET',
                url: `/familie-tilbake/api/behandling/${behandling.behandlingId}/fakta/v1`,
            })
                .then((hentetFakta: Ressurs<IFeilutbetalingFakta>) => {
                    settFeilutbetalingFakta(hentetFakta);
                })
                .catch((error: AxiosError) => {
                    console.log('Error ved henting av fakta: ', error);
                    settFeilutbetalingFakta(
                        byggFeiletRessurs(
                            'Ukjent feil ved henting av fakta-perioder for behandling'
                        )
                    );
                });
        };

        const oppdaterBegrunnelse = (nyVerdi: string) => {
            settSkjemaData({
                begrunnelse: nyVerdi,
                perioder: skjemaData.perioder,
            });
        };

        const oppdaterÅrsakPåPeriode = (periode: FaktaPeriodeSkjemaData, nyÅrsak: HendelseType) => {
            if (behandlePerioderSamlet) {
                const nyePerioder: FaktaPeriodeSkjemaData[] = [];
                for (const per of skjemaData.perioder) {
                    nyePerioder.push({
                        ...per,
                        hendelsestype: nyÅrsak,
                        hendelsesundertype: undefined,
                    });
                }
                settSkjemaData({
                    perioder: nyePerioder,
                    begrunnelse: skjemaData.begrunnelse,
                });
            } else {
                const perioder = skjemaData.perioder;
                const index = perioder.findIndex(bfp => bfp.index === periode.index);
                perioder.splice(index, 1, {
                    ...periode,
                    hendelsestype: nyÅrsak,
                    hendelsesundertype: undefined,
                });
                settSkjemaData({
                    perioder: perioder,
                    begrunnelse: skjemaData.begrunnelse,
                });
            }
        };

        const oppdaterUnderårsakPåPeriode = (
            periode: FaktaPeriodeSkjemaData,
            nyUnderårsak: HendelseUndertype
        ) => {
            if (behandlePerioderSamlet) {
                const nyePerioder: FaktaPeriodeSkjemaData[] = [];
                for (const per of skjemaData.perioder) {
                    if (per.hendelsestype === periode.hendelsestype) {
                        nyePerioder.push({
                            ...per,
                            hendelsesundertype: nyUnderårsak,
                        });
                    } else {
                        nyePerioder.push(per);
                    }
                }
                settSkjemaData({
                    perioder: nyePerioder,
                    begrunnelse: skjemaData.begrunnelse,
                });
            } else {
                const perioder = skjemaData.perioder;
                const index = perioder.findIndex(bfp => bfp.index === periode.index);
                perioder.splice(index, 1, {
                    ...periode,
                    hendelsesundertype: nyUnderårsak,
                });
                settSkjemaData({
                    perioder: perioder,
                    begrunnelse: skjemaData.begrunnelse,
                });
            }
        };

        const validerForInnsending = (): Feilmelding[] => {
            const feilmeldinger: Feilmelding[] = [];
            //@ts-ignore
            const feilmelding = validerTekst(skjemaData.begrunnelse);
            if (feilmelding) {
                feilmeldinger.push({
                    gjelderBegrunnelse: true,
                    melding: feilmelding,
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
                        melding: definerteFeilmeldinger[DEFINERT_FEILMELDING.OBLIGATORISK_FELT],
                    });
                }
            }
            return feilmeldinger;
        };

        const harEndretOpplysninger = () => {
            if (feilutbetalingFakta?.status === RessursStatus.SUKSESS) {
                const hentetData = feilutbetalingFakta.data;
                return (
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

        const sendInnSkjema = () => {
            if (stegErBehandlet && !harEndretOpplysninger()) {
                history.push(
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
                    const payload: FaktaStegPayload = {
                        '@type': 'FAKTA',
                        //@ts-ignore
                        begrunnelse: skjemaData.begrunnelse,
                        feilutbetaltePerioder: skjemaData.perioder.map<PeriodeFaktaStegPayload>(
                            per => ({
                                periode: per.periode,
                                //@ts-ignore
                                hendelsestype: per.hendelsestype,
                                //@ts-ignore
                                hendelsesundertype: per.hendelsesundertype,
                            })
                        ),
                    };
                    request<FaktaStegPayload, string>({
                        method: 'POST',
                        url: `/familie-tilbake/api/behandling/${behandling.behandlingId}/steg/v1`,
                        data: payload,
                    }).then((respons: Ressurs<string>) => {
                        settSenderInn(false);
                        if (respons.status === RessursStatus.SUKSESS) {
                            hentBehandlingMedBehandlingId(behandling.behandlingId, true);
                        }
                    });
                }
            }
        };

        return {
            stegErBehandlet,
            feilutbetalingFakta,
            skjemaData,
            oppdaterBegrunnelse,
            oppdaterÅrsakPåPeriode,
            oppdaterUnderårsakPåPeriode,
            hentFeilutbetalingFakta,
            behandlePerioderSamlet,
            settBehandlePerioderSamlet,
            sendInnSkjema,
            visFeilmeldinger,
            feilmeldinger,
            senderInn,
        };
    }
);

export { FeilutbetalingFaktaProvider, useFeilutbetalingFakta };
