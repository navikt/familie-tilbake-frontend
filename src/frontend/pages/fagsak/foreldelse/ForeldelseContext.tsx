/*
 * Flere useEffect-blokker utleder lokal state fra backend-hentet Ressurs<T> (klassisk
 * fetch-pattern). En ordentlig løsning krever migrering av disse kallene til TanStack
 * Query (useQuery) slik at server state håndteres deklarativt uten useEffect-basert
 * synkronisering.
 */

import type { BehandlingstatusEnum } from '@/generated';
import type { ForeldelseStegPayload, PeriodeForeldelseStegPayload } from '@/typer/api';
import type { ForeldelseResponse } from '@/typer/tilbakekrevingstyper';
import type { ForeldelsePeriodeSkjemeData } from './typer/foreldelse';

import { useQueryClient } from '@tanstack/react-query';
import createUseContext from 'constate';
import { useEffect, useState } from 'react';

import { useBehandlingApi } from '@/api/behandling';
import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import { hentBehandlingQueryKey } from '@/generated/@tanstack/react-query.gen';
import { behandlingHentVedtaksresultatQueryKey } from '@/generated-new/@tanstack/react-query.gen';
import { byggFeiletRessurs, byggHenterRessurs, type Ressurs, RessursStatus } from '@/typer/ressurs';
import { sorterFeilutbetaltePerioder } from '@/utils';
import { useStegNavigering } from '@/utils/sider';

const utledValgtPeriode = (
    skjemaPerioder: ForeldelsePeriodeSkjemeData[],
    behandlingStatus: BehandlingstatusEnum,
    erNyModell: boolean
): ForeldelsePeriodeSkjemeData | undefined => {
    const førsteUbehandletPeriode = skjemaPerioder.find(periode => {
        if (erNyModell) {
            return periode.foreldelsesvurderingstype === 'IKKE_VURDERT';
        } else {
            return !periode.foreldelsesvurderingstype;
        }
    });
    const skalViseÅpentVurderingspanel =
        skjemaPerioder.length > 0 &&
        (behandlingStatus === 'FATTER_VEDTAK' || behandlingStatus === 'AVSLUTTET');

    const sisteVurdertePeriode = [...skjemaPerioder]
        .reverse()
        .find(periode => periode.foreldelsesvurderingstype !== 'IKKE_VURDERT');

    if (førsteUbehandletPeriode) {
        return førsteUbehandletPeriode;
    } else if (skalViseÅpentVurderingspanel) {
        return skjemaPerioder[0];
    } else if (sisteVurdertePeriode) {
        return sisteVurdertePeriode;
    }
    return undefined;
};

export type ForeldelseHook = {
    foreldelse: Ressurs<ForeldelseResponse> | undefined;
    erAutoutført: boolean | undefined;
    stegErBehandlet: boolean;
    skjemaData: ForeldelsePeriodeSkjemeData[];
    oppdaterPeriode: (periode: ForeldelsePeriodeSkjemeData) => void;
    valgtPeriode: ForeldelsePeriodeSkjemeData | undefined;
    setValgtPeriode: (
        valgtPeriode: ForeldelsePeriodeSkjemeData | undefined
    ) => ForeldelsePeriodeSkjemeData | undefined;
    allePerioderBehandlet: boolean;
    harUlagredeEndringer: boolean;
    navigerTilNeste: () => void;
    navigerTilForrige: () => void;
    senderInn: boolean;
    sendInnSkjema: (naviger: () => void) => void;
    onSplitPeriode: (
        periode: ForeldelsePeriodeSkjemeData,
        nyePerioder: ForeldelsePeriodeSkjemeData[]
    ) => void;
};

const [ForeldelseProvider, useForeldelse] = createUseContext(() => {
    const behandling = useBehandling();
    const { erStegBehandlet, erStegAutoutført, nullstillIkkePersisterteKomponenter } =
        useBehandlingState();
    const queryClient = useQueryClient();
    const [foreldelse, setForeldelse] = useState<Ressurs<ForeldelseResponse>>();
    const [skjemaData, setSkjemaData] = useState<ForeldelsePeriodeSkjemeData[]>([]);
    const [erAutoutført, setErAutoutført] = useState(false);
    const [stegErBehandlet, setStegErBehandlet] = useState(false);
    const [valgtPeriode, setValgtPeriode] = useState<ForeldelsePeriodeSkjemeData>();
    const [allePerioderBehandlet, setAllePerioderBehandlet] = useState(false);
    const [senderInn, setSenderInn] = useState(false);
    const { gjerForeldelseKall, sendInnForeldelse } = useBehandlingApi();

    const navigerTilNeste = useStegNavigering('VILKÅRSVURDERING');
    const navigerTilForrige = useStegNavigering(
        behandling.behandlingsstegsinfo.some(steg => steg.behandlingssteg === 'FORHÅNDSVARSEL')
            ? 'FORHÅNDSVARSEL'
            : 'FAKTA'
    );
    // biome-ignore lint/correctness/useExhaustiveDependencies: Se på om dette er en bug eller tiltenkt funksjonalitet. Vurder useEffectEvent senere.
    useEffect(() => {
        setStegErBehandlet(erStegBehandlet('FORELDELSE'));
        const autoutført = erStegAutoutført('FORELDELSE');
        setErAutoutført(autoutført);
        if (!autoutført) {
            hentForeldelse();
        }
    }, [behandling]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: Se på om dette er en bug eller tiltenkt funksjonalitet. Vurder useEffectEvent senere.
    useEffect(() => {
        if (foreldelse?.status === RessursStatus.Suksess) {
            const foreldetPerioder = foreldelse.data.foreldetPerioder;
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
            const valgtForeldelsePeriode = utledValgtPeriode(
                skjemaPerioder,
                behandling.status,
                behandling.erNyModell
            );

            setSkjemaData(skjemaPerioder);

            if (valgtForeldelsePeriode) {
                setValgtPeriode(valgtForeldelsePeriode);
            }
        }
    }, [foreldelse]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: Se på om dette er en bug eller tiltenkt funksjonalitet. Vurder useEffectEvent senere.
    useEffect(() => {
        if (skjemaData) {
            const nokonUbehandlet = skjemaData.some(
                per => !per.begrunnelse || !per.foreldelsesvurderingstype
            );
            setAllePerioderBehandlet(!nokonUbehandlet);
        }
    }, [valgtPeriode]);

    const hentForeldelse = (): void => {
        setForeldelse(byggHenterRessurs());
        gjerForeldelseKall(behandling.behandlingId)
            .then((hentetForeldelse: Ressurs<ForeldelseResponse>) => {
                setForeldelse(hentetForeldelse);
            })
            .catch(() => {
                setForeldelse(
                    byggFeiletRessurs(
                        'Ukjent feil ved henting av foreldelse-perioder for behandling'
                    )
                );
            });
    };

    const oppdaterPeriode = (periode: ForeldelsePeriodeSkjemeData): void => {
        const perioder = skjemaData;
        const index = perioder.findIndex(bfp => bfp.index === periode.index);
        perioder.splice(index, 1, periode);
        setSkjemaData(perioder);
        const førsteUbehandletPeriode = perioder.find(
            per => !per.begrunnelse || !per.foreldelsesvurderingstype
        );
        setValgtPeriode(førsteUbehandletPeriode);
    };

    const onSplitPeriode = (
        periode: ForeldelsePeriodeSkjemeData,
        nyePerioder: ForeldelsePeriodeSkjemeData[]
    ): void => {
        const perioder = skjemaData;
        const index = perioder.findIndex(bfp => bfp.index === periode.index);
        perioder.splice(index, 1, ...nyePerioder);
        setSkjemaData(perioder);
        setValgtPeriode(nyePerioder[0]);
    };

    const erTom = (val: string | null | undefined): boolean => {
        return val === null || val === undefined || val === '';
    };

    const erForskjellig = (a: string | null | undefined, b: string | null | undefined): boolean => {
        if (erTom(a) && erTom(b)) return false;
        return a !== b;
    };

    const harEndretOpplysninger = (): boolean => {
        if (foreldelse?.status === RessursStatus.Suksess) {
            const hentetPerioder = foreldelse.data.foreldetPerioder;
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
                    erForskjellig(skjemaPeriode.foreldelsesfrist, periode?.foreldelsesfrist) ||
                    erForskjellig(skjemaPeriode.oppdagelsesdato, periode?.oppdagelsesdato)
                );
            });
        }
        return false;
    };

    const sendInnSkjema = (naviger: () => void): void => {
        nullstillIkkePersisterteKomponenter();
        setSenderInn(true);
        const payload: ForeldelseStegPayload = {
            '@type': 'FORELDELSE',
            foreldetPerioder: skjemaData.map<PeriodeForeldelseStegPayload>(per => {
                const erForeldelse = per.foreldelsesvurderingstype === 'FORELDET';
                const erTilleggsfrist = per.foreldelsesvurderingstype === 'TILLEGGSFRIST';
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
        sendInnForeldelse(behandling.behandlingId, payload).then(
            async (respons: Ressurs<string>) => {
                setSenderInn(false);
                if (respons.status === RessursStatus.Suksess) {
                    await queryClient.refetchQueries({
                        queryKey: hentBehandlingQueryKey({
                            path: { behandlingId: behandling.behandlingId },
                        }),
                    });
                    void queryClient.invalidateQueries({
                        queryKey: behandlingHentVedtaksresultatQueryKey({
                            path: { behandlingId: behandling.behandlingId },
                        }),
                    });
                    naviger();
                }
            }
        );
    };

    return {
        foreldelse,
        erAutoutført,
        stegErBehandlet,
        skjemaData,
        oppdaterPeriode,
        valgtPeriode,
        setValgtPeriode,
        allePerioderBehandlet,
        harUlagredeEndringer: harEndretOpplysninger(),
        navigerTilNeste,
        navigerTilForrige,
        senderInn,
        sendInnSkjema,
        onSplitPeriode,
    };
});

export { ForeldelseProvider, useForeldelse };
