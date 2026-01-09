import type { PeriodeHandling } from './typer/periodeHandling';
import type { VilkårsvurderingPeriodeSkjemaData } from './typer/vilkårsvurdering';
import type { VilkårdsvurderingStegPayload } from '../../../typer/api';
import type { Behandling } from '../../../typer/behandling';
import type {
    VilkårsvurderingResponse,
    VilkårsvurderingPeriode,
} from '../../../typer/tilbakekrevingstyper';
import type { AxiosError } from 'axios';

import { useMutation } from '@tanstack/react-query';
import createUseContext from 'constate';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useBehandlingApi } from '../../../api/behandling';
import { Feil } from '../../../api/feil';
import { useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';
import { Aktsomhet, Vilkårsresultat } from '../../../kodeverk';
import { Behandlingssteg } from '../../../typer/behandling';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    type Ressurs,
    RessursStatus,
} from '../../../typer/ressurs';
import { sorterFeilutbetaltePerioder } from '../../../utils';
import { SYNLIGE_STEG } from '../../../utils/sider';

export type VilkårsvurderingHook = {
    containerRef: React.RefObject<HTMLDivElement | null>;
    vilkårsvurdering: Ressurs<VilkårsvurderingResponse> | undefined;
    stegErBehandlet: boolean;
    erAutoutført: boolean | undefined;
    kanIlleggeRenter: boolean;
    skjemaData: VilkårsvurderingPeriodeSkjemaData[];
    oppdaterPeriode: (periode: VilkårsvurderingPeriodeSkjemaData) => void;
    valgtPeriode: VilkårsvurderingPeriodeSkjemaData | undefined;
    settValgtPeriode: (periode: VilkårsvurderingPeriodeSkjemaData | undefined) => void;
    behandletPerioder: VilkårsvurderingPeriodeSkjemaData[];
    gåTilNesteSteg: () => void;
    gåTilForrigeSteg: () => void;
    valideringsFeilmelding: string | undefined;
    sendInnSkjemaOgNaviger: () => Promise<PeriodeHandling | undefined>;
    sendInnSkjemaMutation: {
        isPending: boolean;
        isError: boolean;
        error: AxiosError | null;
        reset: () => void;
    };
    onSplitPeriode: (periode: VilkårsvurderingPeriodeSkjemaData) => void;
    nestePeriode: (periode: VilkårsvurderingPeriodeSkjemaData) => void;
    forrigePeriode: (periode: VilkårsvurderingPeriodeSkjemaData) => void;
    hentBehandlingMedBehandlingId: (behandlingId: string) => void;
};

const erBehandlet = (periode: VilkårsvurderingPeriodeSkjemaData): boolean => {
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

const kalkulerTotalBeløp = (perioder: VilkårsvurderingPeriode[]): number => {
    return perioder.reduce(
        (acc: number, periode: VilkårsvurderingPeriode) =>
            !periode.foreldet ? acc + periode.feilutbetaltBeløp : acc,
        0
    );
};

export const erTotalbeløpUnder4Rettsgebyr = (vurdering: VilkårsvurderingResponse): boolean => {
    const totalbeløp = kalkulerTotalBeløp(vurdering.perioder);
    return totalbeløp && vurdering.rettsgebyr ? totalbeløp < vurdering.rettsgebyr * 4 : false;
};

type Props = {
    behandling: Behandling;
};

const [VilkårsvurderingProvider, useVilkårsvurdering] = createUseContext(
    ({ behandling }: Props) => {
        const { fagsystem, eksternFagsakId, ytelsestype } = useFagsak();
        const containerRef = useRef<HTMLDivElement>(null);
        const [vilkårsvurdering, setVilkårsvurdering] =
            useState<Ressurs<VilkårsvurderingResponse>>();
        const [skjemaData, settSkjemaData] = useState<VilkårsvurderingPeriodeSkjemaData[]>([]);
        const [stegErBehandlet, settStegErBehandlet] = useState(false);
        const [erAutoutført, settErAutoutført] = useState<boolean>();
        const [valgtPeriode, settValgtPeriode] = useState<VilkårsvurderingPeriodeSkjemaData>();
        const [kanIlleggeRenter, settKanIlleggeRenter] = useState(true);
        const [behandletPerioder, settBehandletPerioder] = useState<
            VilkårsvurderingPeriodeSkjemaData[]
        >([]);
        const [valideringsFeilmelding, settValideringsFeilmelding] = useState<string>();
        const {
            erStegBehandlet,
            erStegAutoutført,
            visVenteModal,
            hentBehandlingMedBehandlingId,
            nullstillIkkePersisterteKomponenter,
        } = useBehandling();
        const { gjerVilkårsvurderingKall, sendInnVilkårsvurdering } = useBehandlingApi();
        const navigate = useNavigate();
        const kanIleggeRenter = !['BARNETRYGD', 'KONTANTSTØTTE'].includes(ytelsestype);
        const behandlingUrl = `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}`;

        useEffect(() => {
            if (!visVenteModal) {
                settStegErBehandlet(erStegBehandlet(Behandlingssteg.Vilkårsvurdering));
                settErAutoutført(erStegAutoutført(Behandlingssteg.Vilkårsvurdering));
                hentVilkårsvurdering();
                settKanIlleggeRenter(kanIleggeRenter);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [behandling, visVenteModal]);

        useEffect(() => {
            if (vilkårsvurdering?.status === RessursStatus.Suksess) {
                const perioder = vilkårsvurdering.data.perioder;
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
        }, [vilkårsvurdering]);

        useEffect(() => {
            if (skjemaData) {
                const behandletPerioder = skjemaData.filter(
                    periode =>
                        !periode.foreldet &&
                        erBehandlet(periode) &&
                        periode.vilkårsvurderingsresultatInfo?.vilkårsvurderingsresultat !==
                            Vilkårsresultat.Udefinert
                );
                settBehandletPerioder(behandletPerioder);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [valgtPeriode]);

        const hentVilkårsvurdering = (): void => {
            setVilkårsvurdering(byggHenterRessurs());
            gjerVilkårsvurderingKall(behandling.behandlingId)
                .then((hentetVilkårsvurdering: Ressurs<VilkårsvurderingResponse>) => {
                    setVilkårsvurdering(hentetVilkårsvurdering);
                })
                .catch(() => {
                    setVilkårsvurdering(
                        byggFeiletRessurs(
                            'Ukjent feil ved henting av vilkårsvurdering-perioder for behandling'
                        )
                    );
                });
        };

        const gåTilNesteSteg = (): void => {
            navigate(`${behandlingUrl}/${SYNLIGE_STEG.FORESLÅ_VEDTAK.href}`);
        };

        const gåTilForrigeSteg = (): void => {
            navigate(`${behandlingUrl}/${SYNLIGE_STEG.FORELDELSE.href}`);
        };

        const oppdaterPeriode = (periode: VilkårsvurderingPeriodeSkjemaData): void => {
            const perioder = skjemaData;
            const index = perioder.findIndex(bfp => bfp.index === periode.index);
            perioder.splice(index, 1, periode);
            settSkjemaData(perioder);
            const førsteUbehandletPeriode = perioder.find(periode => !erBehandlet(periode));
            førsteUbehandletPeriode !== undefined && settValgtPeriode(førsteUbehandletPeriode);
        };

        const nestePeriode = (periode: VilkårsvurderingPeriodeSkjemaData): void => {
            const index = skjemaData.findIndex(bfp => bfp.index === periode.index);
            if (index < skjemaData.length - 1) {
                settValgtPeriode(skjemaData[index + 1]);
            }
            containerRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        const forrigePeriode = (periode: VilkårsvurderingPeriodeSkjemaData): void => {
            const index = skjemaData.findIndex(bfp => bfp.index === periode.index);
            if (index > 0) {
                settValgtPeriode(skjemaData[index - 1]);
            }
            containerRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        const onSplitPeriode = (
            periode: VilkårsvurderingPeriodeSkjemaData,
            nyePerioder: VilkårsvurderingPeriodeSkjemaData[]
        ): void => {
            const perioder = skjemaData;
            const index = perioder.findIndex(bfp => bfp.index === periode.index);
            perioder.splice(index, 1, ...nyePerioder);
            settSkjemaData(perioder);
            settValgtPeriode(nyePerioder[0]);
        };

        const erAllePerioderBehandlet = skjemaData.every(periode => erBehandlet(periode));

        const validererTotaltBeløpMot4Rettsgebyr = (): boolean => {
            if (vilkårsvurdering?.status !== RessursStatus.Suksess) {
                return false; // Skal ikke være mulig, så return false ok
            }
            if (!erTotalbeløpUnder4Rettsgebyr(vilkårsvurdering.data)) {
                return true;
            }

            const filtrertePerioder = skjemaData
                .filter(({ foreldet }) => !foreldet)
                .filter(
                    periode =>
                        periode.vilkårsvurderingsresultatInfo?.vilkårsvurderingsresultat !==
                        Vilkårsresultat.GodTro
                );
            const ikkeTilbakekrevSmåbeløpPerioder = filtrertePerioder.filter(
                ({ vilkårsvurderingsresultatInfo: resultatInfo }) =>
                    resultatInfo?.aktsomhet?.aktsomhet === Aktsomhet.Uaktsomt &&
                    !resultatInfo?.aktsomhet?.tilbakekrevSmåbeløp
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
            return true;
        };

        const vilkårsvurderingStegPayload = (
            skjemaData: VilkårsvurderingPeriodeSkjemaData[]
        ): VilkårdsvurderingStegPayload => {
            const ikkeForeldetPerioder = skjemaData.filter(periode => !periode.foreldet);
            const payload: VilkårdsvurderingStegPayload = {
                '@type': 'VILKÅRSVURDERING',
                vilkårsvurderingsperioder: ikkeForeldetPerioder
                    .filter(periode => !!periode.begrunnelse)
                    .map(periode => {
                        if (!periode.begrunnelse)
                            throw new Feil(
                                `Periode ${periode.periode.fom} til ${periode.periode.tom} må ha en begrunnelse.`,
                                400
                            );
                        const resultat = periode.vilkårsvurderingsresultatInfo;
                        return {
                            periode: periode.periode,
                            begrunnelse: periode.begrunnelse,
                            vilkårsvurderingsresultat:
                                resultat?.vilkårsvurderingsresultat ?? Vilkårsresultat.Udefinert,
                            godTroDto: resultat?.godTro,
                            aktsomhetDto: resultat?.aktsomhet,
                        };
                    }),
            };
            return payload;
        };

        const sendInnSkjemaMutation = useMutation<
            PeriodeHandling | undefined,
            Feil,
            { payload: VilkårdsvurderingStegPayload; handling: PeriodeHandling }
        >({
            mutationFn: async ({ payload, handling }) => {
                settValideringsFeilmelding(undefined);
                if (!validererTotaltBeløpMot4Rettsgebyr()) {
                    return undefined;
                }
                nullstillIkkePersisterteKomponenter();

                const response = await sendInnVilkårsvurdering(behandling.behandlingId, payload);
                if (response.status === RessursStatus.Suksess) {
                    return handling;
                }

                const finnesFeilmelding =
                    'frontendFeilmelding' in response && response.frontendFeilmelding;
                const finnesHttpStatusKode = 'httpStatusCode' in response;
                throw new Feil(
                    finnesFeilmelding
                        ? response.frontendFeilmelding
                        : 'Ukjent feil ved innsending av vilkårsvurdering.',
                    finnesHttpStatusKode && response.httpStatusCode ? response.httpStatusCode : 500
                );
            },
        });

        const sendInnSkjemaOgNaviger = async (
            handling: PeriodeHandling
        ): Promise<PeriodeHandling | undefined> => {
            const payload = vilkårsvurderingStegPayload(skjemaData);
            return await sendInnSkjemaMutation.mutateAsync({ payload, handling });
        };

        return {
            containerRef,
            vilkårsvurdering,
            stegErBehandlet,
            erAutoutført,
            kanIlleggeRenter,
            skjemaData,
            oppdaterPeriode,
            valgtPeriode,
            settValgtPeriode,
            behandletPerioder,
            gåTilNesteSteg,
            gåTilForrigeSteg,
            valideringsFeilmelding,
            sendInnSkjemaOgNaviger,
            sendInnSkjemaMutation,
            onSplitPeriode,
            nestePeriode,
            forrigePeriode,
            hentBehandlingMedBehandlingId,
            erAllePerioderBehandlet,
        };
    }
);

export { VilkårsvurderingProvider, useVilkårsvurdering };
