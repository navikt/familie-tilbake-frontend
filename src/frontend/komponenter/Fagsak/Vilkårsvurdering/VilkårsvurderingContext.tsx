import type { VilkårsvurderingPeriodeSkjemaData } from './typer/feilutbetalingVilkårsvurdering';
import type { VilkårdsvurderingStegPayload } from '../../../typer/api';
import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';
import type {
    Aktsomhetsvurdering,
    GodTro,
    IFeilutbetalingVilkårsvurdering,
    VilkårsvurderingPeriode,
} from '../../../typer/feilutbetalingtyper';
import type { AxiosError } from 'axios';

import createUseContext from 'constate';
import * as React from 'react';
import { useNavigate } from 'react-router';

import { PeriodeHandling } from './typer/periodeHandling';
import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { Aktsomhet, Vilkårsresultat, Ytelsetype } from '../../../kodeverk';
import { Behandlingssteg } from '../../../typer/behandling';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    type Ressurs,
    RessursStatus,
} from '../../../typer/ressurs';
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
    skjemaPerioder: VilkårsvurderingPeriodeSkjemaData[]
): VilkårsvurderingPeriodeSkjemaData | undefined =>
    skjemaPerioder.find(periode => !erBehandlet(periode)) || skjemaPerioder[0];

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

const [VilkårsvurderingProvider, useVilkårsvurdering] = createUseContext(
    ({ behandling, fagsak }: IProps) => {
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
        const [valideringsFeilmelding, settValideringsFeilmelding] = React.useState<string>();
        const {
            erStegBehandlet,
            erStegAutoutført,
            visVenteModal,
            nullstillIkkePersisterteKomponenter,
        } = useBehandling();
        const { gjerFeilutbetalingVilkårsvurderingKall, sendInnVilkårsvurdering } =
            useBehandlingApi();
        const navigate = useNavigate();
        const kanIleggeRenter = ![Ytelsetype.Barnetrygd, Ytelsetype.Kontantstøtte].includes(
            fagsak.ytelsestype
        );
        const behandlingUrl = `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`;

        React.useEffect(() => {
            if (visVenteModal === false) {
                settStegErBehandlet(erStegBehandlet(Behandlingssteg.Vilkårsvurdering));
                settErAutoutført(erStegAutoutført(Behandlingssteg.Vilkårsvurdering));
                hentFeilutbetalingVilkårsvurdering();
                settKanIlleggeRenter(kanIleggeRenter);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [behandling, visVenteModal]);

        React.useEffect(() => {
            if (feilutbetalingVilkårsvurdering?.status === RessursStatus.Suksess) {
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

                const valgtVilkårsperiode = utledValgtPeriode(skjemaPerioder);
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
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [valgtPeriode]);

        const hentFeilutbetalingVilkårsvurdering = (): void => {
            settFeilutbetalingVilkårsvurdering(byggHenterRessurs());
            gjerFeilutbetalingVilkårsvurderingKall(behandling.behandlingId)
                .then((hentetVilkårsvurdering: Ressurs<IFeilutbetalingVilkårsvurdering>) => {
                    settFeilutbetalingVilkårsvurdering(hentetVilkårsvurdering);
                })
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .catch((_error: AxiosError) => {
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
            førsteUbehandletPeriode !== undefined && settValgtPeriode(førsteUbehandletPeriode);
        };

        const nestePeriode = (periode: VilkårsvurderingPeriodeSkjemaData) => {
            const index = skjemaData.findIndex(bfp => bfp.index === periode.index);
            if (index < skjemaData.length - 1) {
                settValgtPeriode(skjemaData[index + 1]);
            }
            const container = document.getElementById('vilkarsvurdering-container');
            container?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        const forrigePeriode = (periode: VilkårsvurderingPeriodeSkjemaData) => {
            const index = skjemaData.findIndex(bfp => bfp.index === periode.index);
            if (index > 0) {
                settValgtPeriode(skjemaData[index - 1]);
            }
            const container = document.getElementById('vilkarsvurdering-container');
            container?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

        const validererTotaltBeløpMot4Rettsgebyr = () => {
            if (feilutbetalingVilkårsvurdering?.status !== RessursStatus.Suksess) return false; // Skal ikke være mulig, så return false ok

            if (erTotalbeløpUnder4Rettsgebyr(feilutbetalingVilkårsvurdering.data)) {
                const filtrertePerioder = skjemaData
                    .filter(per => !per.foreldet)
                    .filter(
                        per =>
                            per.vilkårsvurderingsresultatInfo?.vilkårsvurderingsresultat !==
                            Vilkårsresultat.GodTro
                    );
                const ikkeTilbakekrevSmåbeløpPerioder = filtrertePerioder.filter(
                    per =>
                        per.vilkårsvurderingsresultatInfo?.aktsomhet?.aktsomhet ===
                            Aktsomhet.SimpelUaktsomhet &&
                        !per.vilkårsvurderingsresultatInfo?.aktsomhet?.tilbakekrevSmåbeløp
                );
                if (
                    ikkeTilbakekrevSmåbeløpPerioder.length > 0 &&
                    ikkeTilbakekrevSmåbeløpPerioder.length !== filtrertePerioder.length
                ) {
                    settValideringsFeilmelding(
                        'Totalbeløpet er under 4 rettsgebyr. Dersom 6.ledd skal anvendes for å frafalle tilbakekrevingen, må denne anvendes likt på alle periodene.'
                    );
                    return false;
                }
            }

            return true;
        };

        const vilkårsvurderingStegPayload = (
            skjemaData: VilkårsvurderingPeriodeSkjemaData[]
        ): VilkårdsvurderingStegPayload => {
            const ikkeForeldetPerioder = skjemaData.filter(per => !per.foreldet);
            const payload: VilkårdsvurderingStegPayload = {
                '@type': 'VILKÅRSVURDERING',
                vilkårsvurderingsperioder: ikkeForeldetPerioder.map(per => {
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
            return payload;
        };

        const sendInnSkjemaOgNaviger = async (handling: PeriodeHandling) => {
            settValideringsFeilmelding(undefined);
            if (!validererTotaltBeløpMot4Rettsgebyr()) {
                return;
            }

            nullstillIkkePersisterteKomponenter();
            settSenderInn(true);
            const payload = vilkårsvurderingStegPayload(skjemaData);

            try {
                await sendInnVilkårsvurdering(behandling.behandlingId, payload);
            } catch (error) {
                settSenderInn(false);
                const feil = `Det oppstod en feil ved innsending av vilkårsvurdering. Prøv igjen senere. Feilmelding: ${error}`;
                settValideringsFeilmelding(feil);
                return;
            } finally {
                settSenderInn(false);
            }

            switch (handling) {
                case PeriodeHandling.GåTilNesteSteg:
                    gåTilNesteSteg();
                    break;
                case PeriodeHandling.GåTilForrigeSteg:
                    gåTilForrigeSteg();
                    break;
                case PeriodeHandling.NestePeriode:
                    valgtPeriode !== undefined && nestePeriode(valgtPeriode);
                    break;
                case PeriodeHandling.ForrigePeriode:
                    valgtPeriode !== undefined && forrigePeriode(valgtPeriode);
                    break;
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
            valideringsFeilmelding,
            sendInnSkjemaOgNaviger,
            onSplitPeriode,
            nestePeriode,
            forrigePeriode,
        };
    }
);

export { VilkårsvurderingProvider, useVilkårsvurdering };
