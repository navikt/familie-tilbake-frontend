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
import { Foreldelsevurdering } from '../../../kodeverk';
import { Behandlingssteg, IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import { IFeilutbetalingForeldelse } from '../../../typer/feilutbetalingtyper';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';
import {
    ForeldelsePeriodeSkjemeData,
    ForeldelseStegPayload,
    PeriodeForeldelseStegPayload,
} from './typer/feilutbetalingForeldelse';

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
}

const [FeilutbetalingForeldelseProvider, useFeilutbetalingForeldelse] = createUseContext(
    ({ behandling, fagsak }: IProps) => {
        const [feilutbetalingForeldelse, settFeilutbetalingForeldelse] = React.useState<
            Ressurs<IFeilutbetalingForeldelse>
        >();
        const [skjemaData, settSkjemaData] = React.useState<ForeldelsePeriodeSkjemeData[]>([]);
        const [erAutoutført, settErAutoutført] = React.useState<boolean>();
        const [stegErBehandlet, settStegErBehandlet] = React.useState<boolean>(false);
        const [valgtPeriode, settValgtPeriode] = React.useState<ForeldelsePeriodeSkjemeData>();
        const [allePerioderBehandlet, settAllePerioderBehandlet] = React.useState<boolean>(false);
        const [senderInn, settSenderInn] = React.useState<boolean>(false);
        const {
            erStegBehandlet,
            erStegAutoutført,
            visVenteModal,
            hentBehandlingMedBehandlingId,
        } = useBehandling();
        const { request } = useHttp();
        const history = useHistory();

        React.useEffect(() => {
            if (visVenteModal === false) {
                settStegErBehandlet(erStegBehandlet(Behandlingssteg.FORELDELSE));
                const autoutført = erStegAutoutført(Behandlingssteg.FORELDELSE);
                settErAutoutført(autoutført);
                if (!autoutført) {
                    hentFeilutbetalingForeldelse();
                }
            }
        }, [behandling, visVenteModal]);

        React.useEffect(() => {
            if (feilutbetalingForeldelse?.status === RessursStatus.SUKSESS) {
                const foreldetPerioder = feilutbetalingForeldelse.data.foreldetPerioder;
                const skjemaPerioder = foreldetPerioder.map((fuFP, index) => {
                    const skjemaPeriode: ForeldelsePeriodeSkjemeData = {
                        index: `idx_fpsd_${index}`,
                        feilutbetaltBeløp: fuFP.feilutbetaltBeløp,
                        periode: fuFP.periode,
                        begrunnelse: fuFP.begrunnelse,
                        foreldelsesvurderingstype: fuFP.foreldelsesvurderingstype,
                        foreldelsesfrist: fuFP.foreldelsesfrist,
                        oppdagelsesdato: fuFP.oppdagelsesdato,
                    };
                    return skjemaPeriode;
                });
                settSkjemaData(skjemaPerioder);

                const førsteUbehandletPeriode = skjemaPerioder.find(
                    per => !per.foreldelsesvurderingstype
                );
                if (førsteUbehandletPeriode) {
                    settValgtPeriode(førsteUbehandletPeriode);
                }
            }
        }, [feilutbetalingForeldelse]);

        React.useEffect(() => {
            if (skjemaData) {
                const nokonUbehandlet = skjemaData.some(
                    per => !per.begrunnelse || !per.foreldelsesvurderingstype
                );
                settAllePerioderBehandlet(!nokonUbehandlet);
            }
        }, [valgtPeriode]);

        const hentFeilutbetalingForeldelse = (): void => {
            settFeilutbetalingForeldelse(byggHenterRessurs());
            request<void, IFeilutbetalingForeldelse>({
                method: 'GET',
                url: `/familie-tilbake/api/behandling/${behandling.behandlingId}/foreldelse/v1`,
            })
                .then((hentetForeldelse: Ressurs<IFeilutbetalingForeldelse>) => {
                    settFeilutbetalingForeldelse(hentetForeldelse);
                })
                .catch((error: AxiosError) => {
                    console.log('Error ved henting av foreldelse: ', error);
                    settFeilutbetalingForeldelse(
                        byggFeiletRessurs(
                            'Ukjent feil ved henting av foreldelse-perioder for behandling'
                        )
                    );
                });
        };

        const gåTilNeste = () => {
            history.push(
                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.VILKÅRSVURDERING.href}`
            );
        };

        const gåTilForrige = () => {
            history.push(
                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.FAKTA.href}`
            );
        };

        const oppdaterPeriode = (periode: ForeldelsePeriodeSkjemeData) => {
            const perioder = skjemaData;
            const index = perioder.findIndex(bfp => bfp.index === periode.index);
            perioder.splice(index, 1, periode);
            settSkjemaData(perioder);
            const førsteUbehandletPeriode = perioder.find(
                per => !per.begrunnelse || !per.foreldelsesvurderingstype
            );
            settValgtPeriode(førsteUbehandletPeriode);
        };

        const onSplitPeriode = (
            periode: ForeldelsePeriodeSkjemeData,
            nyePerioder: ForeldelsePeriodeSkjemeData[]
        ) => {
            const perioder = skjemaData;
            const index = perioder.findIndex(bfp => bfp.index === periode.index);
            perioder.splice(index, 1, ...nyePerioder);
            settSkjemaData(perioder);
            settValgtPeriode(nyePerioder[0]);
        };

        const harEndretOpplysninger = () => {
            if (feilutbetalingForeldelse?.status === RessursStatus.SUKSESS) {
                const hentetPerioder = feilutbetalingForeldelse.data.foreldetPerioder;
                return skjemaData.some(skjemaPeriode => {
                    if (skjemaPeriode.erSplittet) return true;
                    const periode = hentetPerioder.find(
                        per =>
                            per.periode.fom === skjemaPeriode.periode.fom &&
                            per.periode.tom === skjemaPeriode.periode.tom
                    );
                    return (
                        skjemaPeriode.begrunnelse !== periode?.begrunnelse ||
                        skjemaPeriode.foreldelsesvurderingstype !==
                            periode?.foreldelsesvurderingstype ||
                        skjemaPeriode.foreldelsesfrist !== periode?.foreldelsesfrist ||
                        skjemaPeriode.oppdagelsesdato !== periode?.oppdagelsesdato
                    );
                });
            }
        };

        const sendInnSkjema = () => {
            if (stegErBehandlet && !harEndretOpplysninger()) {
                gåTilNeste();
            } else {
                settSenderInn(true);
                const payload: ForeldelseStegPayload = {
                    '@type': 'FORELDELSE',
                    foreldetPerioder: skjemaData.map<PeriodeForeldelseStegPayload>(per => {
                        const erForeldelse =
                            per.foreldelsesvurderingstype === Foreldelsevurdering.FORELDET;
                        const erTilleggsfrist =
                            per.foreldelsesvurderingstype === Foreldelsevurdering.TILLEGGSFRIST;
                        return {
                            periode: per.periode,
                            begrunnelse: per.begrunnelse,
                            foreldelsesvurderingstype: per.foreldelsesvurderingstype,
                            foreldelsesfrist:
                                erForeldelse || erTilleggsfrist ? per.foreldelsesfrist : undefined,
                            oppdagelsesdato: erTilleggsfrist ? per.oppdagelsesdato : undefined,
                        };
                    }),
                };
                request<ForeldelseStegPayload, string>({
                    method: 'POST',
                    url: `/familie-tilbake/api/behandling/${behandling.behandlingId}/steg/v1`,
                    data: payload,
                })
                    .then((respons: Ressurs<string>) => {
                        settSenderInn(false);
                        if (respons.status === RessursStatus.SUKSESS) {
                            hentBehandlingMedBehandlingId(behandling.behandlingId, true);
                        }
                    })
                    .catch((error: AxiosError) => {
                        console.log('Error ved sending av oppdaterte foreldelse: ', error);
                        settSenderInn(false);
                    });
            }
        };

        const lukkValgtPeriode = () => {
            settValgtPeriode(undefined);
        };

        return {
            feilutbetalingForeldelse,
            erAutoutført,
            stegErBehandlet,
            skjemaData,
            oppdaterPeriode,
            valgtPeriode,
            settValgtPeriode,
            allePerioderBehandlet,
            gåTilNeste,
            gåTilForrige,
            senderInn,
            sendInnSkjema,
            onSplitPeriode,
            lukkValgtPeriode,
        };
    }
);

export { FeilutbetalingForeldelseProvider, useFeilutbetalingForeldelse };
