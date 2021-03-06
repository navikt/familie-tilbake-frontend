import * as React from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';
import deepEqual from 'deep-equal';
import { useHistory } from 'react-router';

import { useHttp } from '@navikt/familie-http';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    Ressurs,
    RessursStatus,
} from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { Aktsomhet, Vilkårsresultat, Ytelsetype } from '../../../kodeverk';
import { Behandlingssteg, IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import {
    Aktsomhetsvurdering,
    GodTro,
    IFeilutbetalingVilkårsvurdering,
    VilkårsvurderingPeriode,
} from '../../../typer/feilutbetalingtyper';
import { sorterFeilutbetaltePerioder } from '../../../utils';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';
import {
    PeriodeVilkårsvurderingStegPayload,
    VilkårdsvurderingStegPayload,
    VilkårsvurderingPeriodeSkjemaData,
} from './typer/feilutbetalingVilkårsvurdering';

const erBehandlet = (periode: VilkårsvurderingPeriodeSkjemaData) => {
    return (
        periode.foreldet ||
        (!!periode.vilkårsvurderingsresultatInfo?.vilkårsvurderingsresultat &&
            !!periode.begrunnelse)
    );
};

const kalkulerTotalBeløp = (perioder: VilkårsvurderingPeriode[]) => {
    return perioder.reduce(
        (acc: number, periode: VilkårsvurderingPeriode) =>
            !periode.foreldet ? acc + periode.feilutbetaltBeløp : acc,
        0
    );
};

export const erTotalbeløpUnder4Rettsgebyr = (vurdering: IFeilutbetalingVilkårsvurdering) => {
    const totalbeløp = kalkulerTotalBeløp(vurdering?.perioder);
    return totalbeløp && vurdering?.rettsgebyr ? totalbeløp < vurdering?.rettsgebyr * 4 : false;
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
        const { request } = useHttp();
        const history = useHistory();

        React.useEffect(() => {
            if (visVenteModal === false) {
                settStegErBehandlet(erStegBehandlet(Behandlingssteg.VILKÅRSVURDERING));
                settErAutoutført(erStegAutoutført(Behandlingssteg.VILKÅRSVURDERING));
                hentFeilutbetalingVilkårsvurdering();
                settKanIlleggeRenter(fagsak.ytelsestype !== Ytelsetype.BARNETRYGD);
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
                settSkjemaData(skjemaPerioder);

                const førsteUbehandletPeriode = skjemaPerioder.find(per => !erBehandlet(per));
                if (førsteUbehandletPeriode) {
                    settValgtPeriode(førsteUbehandletPeriode);
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
            request<void, IFeilutbetalingVilkårsvurdering>({
                method: 'GET',
                url: `/familie-tilbake/api/behandling/${behandling.behandlingId}/vilkarsvurdering/v1`,
            })
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

        const gåTilNeste = () => {
            history.push(
                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.VEDTAK.href}`
            );
        };

        const gåTilForrige = () => {
            history.push(
                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.FORELDELSE.href}`
            );
        };

        const oppdaterPeriode = (periode: VilkårsvurderingPeriodeSkjemaData) => {
            const perioder = skjemaData;
            const index = perioder.findIndex(bfp => bfp.index === periode.index);
            perioder.splice(index, 1, periode);
            settSkjemaData(perioder);
            const førsteUbehandletPeriode = perioder.find(per => !erBehandlet(per));
            settValgtPeriode(førsteUbehandletPeriode);
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
                const uforeldetPerioder = skjemaData.filter(per => !per.foreldet);
                const ikkeTilbakkrevSmåbeløpPerioder = uforeldetPerioder.filter(
                    per =>
                        per.vilkårsvurderingsresultatInfo?.aktsomhet?.aktsomhet ===
                            Aktsomhet.SIMPEL_UAKTSOMHET &&
                        !per.vilkårsvurderingsresultatInfo?.aktsomhet?.tilbakekrevSmåbeløp
                );
                if (
                    ikkeTilbakkrevSmåbeløpPerioder.length > 0 &&
                    ikkeTilbakkrevSmåbeløpPerioder.length !== uforeldetPerioder.length
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
                    gåTilNeste();
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
                    request<VilkårdsvurderingStegPayload, string>({
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

        const lukkValgtPeriode = () => {
            settSenderInn(false);
            settValgtPeriode(undefined);
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
            gåTilNeste,
            gåTilForrige,
            senderInn,
            valideringsfeil,
            valideringsFeilmelding,
            sendInnSkjema,
            onSplitPeriode,
            lukkValgtPeriode,
        };
    });

export { FeilutbetalingVilkårsvurderingProvider, useFeilutbetalingVilkårsvurdering };
