import * as React from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';
import deepEqual from 'deep-equal';
import { useNavigate } from 'react-router-dom';

import {
    byggFeiletRessurs,
    byggHenterRessurs,
    type Ressurs,
    RessursStatus,
} from '@navikt/familie-typer';

import { VilkårsvurderingPeriodeSkjemaData } from './typer/feilutbetalingVilkårsvurdering';
import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { Aktsomhet, Vilkårsresultat, Ytelsetype } from '../../../kodeverk';
import {
    PeriodeVilkårsvurderingStegPayload,
    VilkårdsvurderingStegPayload,
} from '../../../typer/api';
import { Behandlingssteg, Behandlingstatus, IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import {
    Aktsomhetsvurdering,
    GodTro,
    IFeilutbetalingVilkårsvurdering,
    VilkårsvurderingPeriode,
} from '../../../typer/feilutbetalingtyper';
import { sorterFeilutbetaltePerioder } from '../../../utils';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';

const erBehandlet = (periode: VilkårsvurderingPeriodeSkjemaData) => {
    return (
        periode.foreldet ||
        (!!periode.vilkårsvurderingsresultatInfo?.vilkårsvurderingsresultat &&
            !!periode.begrunnelse)
    );
};

const utledValgtPeriode = (
    skjemaPerioder: VilkårsvurderingPeriodeSkjemaData[],
    behandlingStatus: Behandlingstatus
): VilkårsvurderingPeriodeSkjemaData | undefined => {
    const førsteUbehandledePeriode = skjemaPerioder.find(periode => !erBehandlet(periode));
    const skalViseÅpentVurderingspanel =
        skjemaPerioder.length > 0 &&
        (behandlingStatus === Behandlingstatus.FATTER_VEDTAK ||
            behandlingStatus === Behandlingstatus.AVSLUTTET);

    if (førsteUbehandledePeriode) {
        return førsteUbehandledePeriode;
    } else if (skalViseÅpentVurderingspanel) {
        return skjemaPerioder[0];
    }
    return undefined;
};

const kalkulerTotalBeløp = (perioder: VilkårsvurderingPeriode[]) => {
    return perioder.reduce(
        (acc: number, periode: VilkårsvurderingPeriode) =>
            !periode.foreldet ? acc + periode.feilutbetaltBeløp : acc,
        0
    );
};

export const erTotalbeløpUnder4Rettsgebyr = (vurdering: IFeilutbetalingVilkårsvurdering) => {
    const totalbeløp = kalkulerTotalBeløp(vurdering.perioder);
    return totalbeløp && vurdering.rettsgebyr ? totalbeløp < vurdering.rettsgebyr * 4 : false;
};

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
}

const [FeilutbetalingVilkårsvurderingProvider, useFeilutbetalingVilkårsvurdering] =
    createUseContext(({ behandling, fagsak }: IProps) => {
        const [feilutbetalingVilkårsvurdering, settFeilutbetalingVilkårsvurdering] =
            React.useState<Ressurs<IFeilutbetalingVilkårsvurdering>>();
        const [skjemaData, settSkjemaData] = React.useState<VilkårsvurderingPeriodeSkjemaData[]>(
            []
        );
        const [stegErBehandlet, settStegErBehandlet] = React.useState<boolean>(false);
        const [erAutoutført, settErAutoutført] = React.useState<boolean>();
        const [valgtPeriode, settValgtPeriode] =
            React.useState<VilkårsvurderingPeriodeSkjemaData>();
        const [kanIlleggeRenter, settKanIlleggeRenter] = React.useState<boolean>(true);
        const [behandletPerioder, settBehandletPerioder] = React.useState<
            VilkårsvurderingPeriodeSkjemaData[]
        >([]);
        const [allePerioderBehandlet, settAllePerioderBehandlet] = React.useState<boolean>(false);
        const [senderInn, settSenderInn] = React.useState<boolean>(false);
        const [valideringsfeil, settValideringsfeil] = React.useState<boolean>(false);
        const [valideringsFeilmelding, settValideringsFeilmelding] = React.useState<string>();
        const { erStegBehandlet, erStegAutoutført, visVenteModal, hentBehandlingMedBehandlingId } =
            useBehandling();
        const { gjerFeilutbetalingVilkårsvurderingKall, sendInnFeilutbetalingVilkårsvurdering } =
            useBehandlingApi();
        const navigate = useNavigate();
        const kanIleggeRenter = ![Ytelsetype.BARNETRYGD, Ytelsetype.KONTANTSTØTTE].includes(
            fagsak.ytelsestype
        );
        const behandlingUrl = `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`;

        React.useEffect(() => {
            if (visVenteModal === false) {
                settStegErBehandlet(erStegBehandlet(Behandlingssteg.VILKÅRSVURDERING));
                settErAutoutført(erStegAutoutført(Behandlingssteg.VILKÅRSVURDERING));
                hentFeilutbetalingVilkårsvurdering();
                settKanIlleggeRenter(kanIleggeRenter);
            }
        }, [behandling, visVenteModal]);

        React.useEffect(() => {
            if (feilutbetalingVilkårsvurdering?.status === RessursStatus.SUKSESS) {
                const perioder = feilutbetalingVilkårsvurdering.data.perioder;
                const sortertePerioder = sorterFeilutbetaltePerioder(perioder);
                const skjemaPerioder = sortertePerioder.map((fuFP, index) => {
                    const skjemaPeriode: VilkårsvurderingPeriodeSkjemaData = {
                        index: `idx_fpsd_${index}`,
                        ...fuFP,
                    };
                    return skjemaPeriode;
                });
                const valgtVilkårsperiode = utledValgtPeriode(skjemaPerioder, behandling.status);

                settSkjemaData(skjemaPerioder);

                if (valgtVilkårsperiode) {
                    settValgtPeriode(valgtVilkårsperiode);
                }
            }
        }, [feilutbetalingVilkårsvurdering]);

        React.useEffect(() => {
            if (skjemaData) {
                const nokonUbehandlet = skjemaData.some(per => !erBehandlet(per));
                const behandletPerioder = skjemaData.filter(
                    per => !per.foreldet && erBehandlet(per)
                );
                settAllePerioderBehandlet(!nokonUbehandlet);
                settBehandletPerioder(behandletPerioder);
            }
        }, [valgtPeriode]);

        const hentFeilutbetalingVilkårsvurdering = (): void => {
            settFeilutbetalingVilkårsvurdering(byggHenterRessurs());
            gjerFeilutbetalingVilkårsvurderingKall(behandling.behandlingId)
                .then((hentetVilkårsvurdering: Ressurs<IFeilutbetalingVilkårsvurdering>) => {
                    settFeilutbetalingVilkårsvurdering(hentetVilkårsvurdering);
                })
                .catch((error: AxiosError) => {
                    console.log('Error ved henting av vilkårsvurdering: ', error);
                    settFeilutbetalingVilkårsvurdering(
                        byggFeiletRessurs(
                            'Ukjent feil ved henting av vilkårsvurdering-perioder for behandling'
                        )
                    );
                });
        };

        const gåTilNesteSteg = () => {
            navigate(`${behandlingUrl}/${sider.VEDTAK.href}`);
        };

        const gåTilForrigeSteg = () => {
            navigate(`${behandlingUrl}/${sider.FORELDELSE.href}`);
        };

        const oppdaterPeriode = (periode: VilkårsvurderingPeriodeSkjemaData) => {
            const perioder = skjemaData;
            const index = perioder.findIndex(bfp => bfp.index === periode.index);
            perioder.splice(index, 1, periode);
            settSkjemaData(perioder);
            const førsteUbehandletPeriode = perioder.find(per => !erBehandlet(per));
            settValgtPeriode(førsteUbehandletPeriode);
        };

        const nestePeriode = (periode: VilkårsvurderingPeriodeSkjemaData) => {
            const index = skjemaData.findIndex(bfp => bfp.index === periode.index);
            if (index < skjemaData.length - 1) {
                settValgtPeriode(skjemaData[index + 1]);
            }
        };

        const forrigePeriode = (periode: VilkårsvurderingPeriodeSkjemaData) => {
            const index = skjemaData.findIndex(bfp => bfp.index === periode.index);
            if (index > 0) {
                settValgtPeriode(skjemaData[index - 1]);
            }
        };

        const onSplitPeriode = (
            periode: VilkårsvurderingPeriodeSkjemaData,
            nyePerioder: VilkårsvurderingPeriodeSkjemaData[]
        ) => {
            const perioder = skjemaData;
            const index = perioder.findIndex(bfp => bfp.index === periode.index);
            perioder.splice(index, 1, ...nyePerioder);
            settSkjemaData(perioder);
            settValgtPeriode(nyePerioder[0]);
        };

        const validerPerioder = () => {
            if (feilutbetalingVilkårsvurdering?.status !== RessursStatus.SUKSESS) return false; // Skal ikke være mulig, så return false ok

            if (erTotalbeløpUnder4Rettsgebyr(feilutbetalingVilkårsvurdering.data)) {
                const filtrertePerioder = skjemaData
                    .filter(per => !per.foreldet)
                    .filter(
                        per =>
                            per.vilkårsvurderingsresultatInfo?.vilkårsvurderingsresultat !==
                            Vilkårsresultat.GOD_TRO
                    );
                const ikkeTilbakekrevSmåbeløpPerioder = filtrertePerioder.filter(
                    per =>
                        per.vilkårsvurderingsresultatInfo?.aktsomhet?.aktsomhet ===
                            Aktsomhet.SIMPEL_UAKTSOMHET &&
                        !per.vilkårsvurderingsresultatInfo?.aktsomhet?.tilbakekrevSmåbeløp
                );
                if (
                    ikkeTilbakekrevSmåbeløpPerioder.length > 0 &&
                    ikkeTilbakekrevSmåbeløpPerioder.length !== filtrertePerioder.length
                ) {
                    settValideringsFeilmelding(
                        'Totalbeløpet er under 4 rettsgebyr. Dersom 6.ledd skal anvendes for å frafalle tilbakekrevingen, må denne anvendes likt på alle periodene.'
                    );
                    settValideringsfeil(true);
                    return false;
                }
            }

            return true;
        };

        const harEndretOpplysninger = (
            ikkeforeldetPerioder: VilkårsvurderingPeriodeSkjemaData[]
        ) => {
            if (feilutbetalingVilkårsvurdering?.status === RessursStatus.SUKSESS) {
                const hentetPerioder = feilutbetalingVilkårsvurdering.data.perioder;
                return ikkeforeldetPerioder.some(skjemaPeriode => {
                    if (skjemaPeriode.erSplittet) return true;
                    const periode = hentetPerioder.find(
                        per =>
                            per.periode.fom === skjemaPeriode.periode.fom &&
                            per.periode.tom === skjemaPeriode.periode.tom
                    );
                    const vurderingSkjema = skjemaPeriode.vilkårsvurderingsresultatInfo;
                    const vurderingPeriode = periode?.vilkårsvurderingsresultatInfo;
                    const endretBegrunnelseEllerVurdering =
                        skjemaPeriode.begrunnelse !== periode?.begrunnelse ||
                        vurderingSkjema?.vilkårsvurderingsresultat !==
                            vurderingPeriode?.vilkårsvurderingsresultat;
                    const endretGodTro = !deepEqual(
                        vurderingSkjema?.godTro,
                        vurderingPeriode?.godTro
                    );
                    const endretAktsomhet = !deepEqual(
                        vurderingSkjema?.aktsomhet,
                        vurderingPeriode?.aktsomhet
                    );
                    return endretBegrunnelseEllerVurdering || endretGodTro || endretAktsomhet;
                });
            }
        };

        const sendInnSkjema = () => {
            settValideringsFeilmelding(undefined);
            settValideringsfeil(false);
            if (validerPerioder()) {
                const ikkeForeldetPerioder = skjemaData.filter(per => !per.foreldet);
                if (stegErBehandlet && !harEndretOpplysninger(ikkeForeldetPerioder)) {
                    gåTilNesteSteg();
                } else {
                    settSenderInn(true);
                    const payload: VilkårdsvurderingStegPayload = {
                        '@type': 'VILKÅRSVURDERING',
                        vilkårsvurderingsperioder:
                            ikkeForeldetPerioder.map<PeriodeVilkårsvurderingStegPayload>(per => {
                                const resultat = per.vilkårsvurderingsresultatInfo;
                                return {
                                    periode: per.periode,
                                    begrunnelse: per.begrunnelse as string,
                                    vilkårsvurderingsresultat:
                                        resultat?.vilkårsvurderingsresultat as Vilkårsresultat,
                                    godTroDto: resultat?.godTro as GodTro,
                                    aktsomhetDto: resultat?.aktsomhet as Aktsomhetsvurdering,
                                };
                            }),
                    };
                    sendInnFeilutbetalingVilkårsvurdering(behandling.behandlingId, payload).then(
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
            }
        };

        return {
            feilutbetalingVilkårsvurdering,
            stegErBehandlet,
            erAutoutført,
            kanIlleggeRenter,
            skjemaData,
            oppdaterPeriode,
            valgtPeriode,
            settValgtPeriode,
            behandletPerioder,
            allePerioderBehandlet,
            gåTilNesteSteg,
            gåTilForrigeSteg,
            senderInn,
            valideringsfeil,
            valideringsFeilmelding,
            sendInnSkjema,
            onSplitPeriode,
            nestePeriode,
            forrigePeriode,
        };
    });

export { FeilutbetalingVilkårsvurderingProvider, useFeilutbetalingVilkårsvurdering };
