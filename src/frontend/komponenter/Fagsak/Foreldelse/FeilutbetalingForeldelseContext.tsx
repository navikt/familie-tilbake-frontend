import * as React from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';
import { useNavigate } from 'react-router-dom';

import {
    byggFeiletRessurs,
    byggHenterRessurs,
    type Ressurs,
    RessursStatus,
} from '@navikt/familie-typer';

import { ForeldelsePeriodeSkjemeData } from './typer/feilutbetalingForeldelse';
import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { useRedirectEtterLagring } from '../../../hooks/useRedirectEtterLagring';
import { Foreldelsevurdering } from '../../../kodeverk';
import { ForeldelseStegPayload, PeriodeForeldelseStegPayload } from '../../../typer/api';
import { Behandlingssteg, Behandlingstatus, IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import { IFeilutbetalingForeldelse } from '../../../typer/feilutbetalingtyper';
import { sorterFeilutbetaltePerioder } from '../../../utils';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';

const utledValgtPeriode = (
    skjemaPerioder: ForeldelsePeriodeSkjemeData[],
    behandlingStatus: Behandlingstatus
) => {
    const førsteUbehandletPeriode = skjemaPerioder.find(
        periode => !periode.foreldelsesvurderingstype
    );
    const skalViseÅpentVurderingspanel =
        skjemaPerioder.length > 0 &&
        (behandlingStatus === Behandlingstatus.FATTER_VEDTAK ||
            behandlingStatus === Behandlingstatus.AVSLUTTET);

    if (førsteUbehandletPeriode) {
        return førsteUbehandletPeriode;
    } else if (skalViseÅpentVurderingspanel) {
        return skjemaPerioder[0];
    }
    return undefined;
};

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
}

const [FeilutbetalingForeldelseProvider, useFeilutbetalingForeldelse] = createUseContext(
    ({ behandling, fagsak }: IProps) => {
        const [feilutbetalingForeldelse, settFeilutbetalingForeldelse] =
            React.useState<Ressurs<IFeilutbetalingForeldelse>>();
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
            nullstillIkkePersisterteKomponenter,
        } = useBehandling();
        const { utførRedirect } = useRedirectEtterLagring();
        const { gjerFeilutbetalingForeldelseKall, sendInnFeilutbetalingForeldelse } =
            useBehandlingApi();
        const navigate = useNavigate();
        const behandlingUrl = `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`;

        React.useEffect(() => {
            if (visVenteModal === false) {
                settStegErBehandlet(erStegBehandlet(Behandlingssteg.FORELDELSE));
                const autoutført = erStegAutoutført(Behandlingssteg.FORELDELSE);
                settErAutoutført(autoutført);
                if (!autoutført) {
                    hentFeilutbetalingForeldelse();
                }
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [behandling, visVenteModal]);

        React.useEffect(() => {
            if (feilutbetalingForeldelse?.status === RessursStatus.SUKSESS) {
                const foreldetPerioder = feilutbetalingForeldelse.data.foreldetPerioder;
                const sortertePerioder = sorterFeilutbetaltePerioder(foreldetPerioder);
                const skjemaPerioder = sortertePerioder.map((fuFP, index) => {
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
                const valgtForeldelsePeriode = utledValgtPeriode(skjemaPerioder, behandling.status);

                settSkjemaData(skjemaPerioder);

                if (valgtForeldelsePeriode) {
                    settValgtPeriode(valgtForeldelsePeriode);
                }
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [feilutbetalingForeldelse]);

        React.useEffect(() => {
            if (skjemaData) {
                const nokonUbehandlet = skjemaData.some(
                    per => !per.begrunnelse || !per.foreldelsesvurderingstype
                );
                settAllePerioderBehandlet(!nokonUbehandlet);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [valgtPeriode]);

        const hentFeilutbetalingForeldelse = (): void => {
            settFeilutbetalingForeldelse(byggHenterRessurs());
            gjerFeilutbetalingForeldelseKall(behandling.behandlingId)
                .then((hentetForeldelse: Ressurs<IFeilutbetalingForeldelse>) => {
                    settFeilutbetalingForeldelse(hentetForeldelse);
                })
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .catch((_error: AxiosError) => {
                    settFeilutbetalingForeldelse(
                        byggFeiletRessurs(
                            'Ukjent feil ved henting av foreldelse-perioder for behandling'
                        )
                    );
                });
        };

        const gåTilNesteSteg = () => {
            navigate(`${behandlingUrl}/${sider.VILKÅRSVURDERING.href}`);
        };

        const gåTilForrigeSteg = () => {
            navigate(`${behandlingUrl}/${sider.FAKTA.href}`);
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

        const nestePeriode = (periode: ForeldelsePeriodeSkjemeData) => {
            const index = skjemaData.findIndex(bfp => bfp.index === periode.index);
            if (index < skjemaData.length - 1) {
                settValgtPeriode(skjemaData[index + 1]);
            }
        };

        const forrigePeriode = (periode: ForeldelsePeriodeSkjemeData) => {
            const index = skjemaData.findIndex(bfp => bfp.index === periode.index);
            if (index > 0) {
                settValgtPeriode(skjemaData[index - 1]);
            }
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
            nullstillIkkePersisterteKomponenter();
            if (stegErBehandlet && !harEndretOpplysninger()) {
                utførRedirect(`${behandlingUrl}/${sider.VILKÅRSVURDERING.href}`);
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
                sendInnFeilutbetalingForeldelse(behandling.behandlingId, payload).then(
                    (respons: Ressurs<string>) => {
                        settSenderInn(false);
                        if (respons.status === RessursStatus.SUKSESS) {
                            hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                                navigate(
                                    `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                                );
                            });
                        }
                    }
                );
            }
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
            gåTilNesteSteg,
            gåTilForrigeSteg,
            senderInn,
            sendInnSkjema,
            onSplitPeriode,
            nestePeriode,
            forrigePeriode,
        };
    }
);

export { FeilutbetalingForeldelseProvider, useFeilutbetalingForeldelse };
