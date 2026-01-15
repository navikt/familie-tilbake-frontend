import type { ForeldelsePeriodeSkjemeData } from './typer/foreldelse';
import type { BehandlingstatusEnum } from '../../../generated';
import type { ForeldelseStegPayload, PeriodeForeldelseStegPayload } from '../../../typer/api';
import type { ForeldelseResponse } from '../../../typer/tilbakekrevingstyper';

import { useQueryClient } from '@tanstack/react-query';
import createUseContext from 'constate';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';
import { useRedirectEtterLagring } from '../../../hooks/useRedirectEtterLagring';
import { Foreldelsevurdering } from '../../../kodeverk';
import { Behandlingssteg, Behandlingstatus } from '../../../typer/behandling';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    type Ressurs,
    RessursStatus,
} from '../../../typer/ressurs';
import { sorterFeilutbetaltePerioder } from '../../../utils';
import { SYNLIGE_STEG } from '../../../utils/sider';

const utledValgtPeriode = (
    skjemaPerioder: ForeldelsePeriodeSkjemeData[],
    behandlingStatus: BehandlingstatusEnum
): ForeldelsePeriodeSkjemeData | undefined => {
    const førsteUbehandletPeriode = skjemaPerioder.find(
        periode => !periode.foreldelsesvurderingstype
    );
    const skalViseÅpentVurderingspanel =
        skjemaPerioder.length > 0 &&
        (behandlingStatus === Behandlingstatus.FatterVedtak ||
            behandlingStatus === Behandlingstatus.Avsluttet);

    if (førsteUbehandletPeriode) {
        return førsteUbehandletPeriode;
    } else if (skalViseÅpentVurderingspanel) {
        return skjemaPerioder[0];
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
    settValgtPeriode: (
        valgtPeriode: ForeldelsePeriodeSkjemeData | undefined
    ) => ForeldelsePeriodeSkjemeData | undefined;
    allePerioderBehandlet: boolean;
    gåTilNesteSteg: () => void;
    gåTilForrigeSteg: () => void;
    senderInn: boolean;
    sendInnSkjema: () => void;
    onSplitPeriode: (
        periode: ForeldelsePeriodeSkjemeData,
        nyePerioder: ForeldelsePeriodeSkjemeData[]
    ) => void;
};

const [ForeldelseProvider, useForeldelse] = createUseContext(() => {
    const { fagsystem, eksternFagsakId } = useFagsak();
    const { behandling, erStegBehandlet, erStegAutoutført, nullstillIkkePersisterteKomponenter } =
        useBehandling();
    const queryClient = useQueryClient();
    const [foreldelse, setForeldelse] = useState<Ressurs<ForeldelseResponse>>();
    const [skjemaData, settSkjemaData] = useState<ForeldelsePeriodeSkjemeData[]>([]);
    const [erAutoutført, settErAutoutført] = useState<boolean>();
    const [stegErBehandlet, settStegErBehandlet] = useState<boolean>(false);
    const [valgtPeriode, settValgtPeriode] = useState<ForeldelsePeriodeSkjemeData>();
    const [allePerioderBehandlet, settAllePerioderBehandlet] = useState<boolean>(false);
    const [senderInn, settSenderInn] = useState<boolean>(false);
    const { utførRedirect } = useRedirectEtterLagring();
    const { gjerForeldelseKall, sendInnForeldelse } = useBehandlingApi();
    const navigate = useNavigate();
    const behandlingUrl = `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}`;

    useEffect(() => {
        settStegErBehandlet(erStegBehandlet(Behandlingssteg.Foreldelse));
        const autoutført = erStegAutoutført(Behandlingssteg.Foreldelse);
        settErAutoutført(autoutført);
        if (!autoutført) {
            hentForeldelse();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behandling]);

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
            const valgtForeldelsePeriode = utledValgtPeriode(skjemaPerioder, behandling.status);

            settSkjemaData(skjemaPerioder);

            if (valgtForeldelsePeriode) {
                settValgtPeriode(valgtForeldelsePeriode);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [foreldelse]);

    useEffect(() => {
        if (skjemaData) {
            const nokonUbehandlet = skjemaData.some(
                per => !per.begrunnelse || !per.foreldelsesvurderingstype
            );
            settAllePerioderBehandlet(!nokonUbehandlet);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const gåTilNesteSteg = (): void => {
        navigate(`${behandlingUrl}/${SYNLIGE_STEG.VILKÅRSVURDERING.href}`);
    };

    const gåTilForrigeSteg = (): void => {
        navigate(
            `${behandlingUrl}/${
                behandling.behandlingsstegsinfo.some(
                    steg => steg.behandlingssteg === Behandlingssteg.Forhåndsvarsel
                )
                    ? SYNLIGE_STEG.FORHÅNDSVARSEL.href
                    : SYNLIGE_STEG.FAKTA.href
            }`
        );
    };

    const oppdaterPeriode = (periode: ForeldelsePeriodeSkjemeData): void => {
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
    ): void => {
        const perioder = skjemaData;
        const index = perioder.findIndex(bfp => bfp.index === periode.index);
        perioder.splice(index, 1, ...nyePerioder);
        settSkjemaData(perioder);
        settValgtPeriode(nyePerioder[0]);
    };

    const harEndretOpplysninger = (): boolean | undefined => {
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
                    skjemaPeriode.foreldelsesfrist !== periode?.foreldelsesfrist ||
                    skjemaPeriode.oppdagelsesdato !== periode?.oppdagelsesdato
                );
            });
        }
    };

    const sendInnSkjema = (): void => {
        nullstillIkkePersisterteKomponenter();
        if (stegErBehandlet && !harEndretOpplysninger()) {
            utførRedirect(`${behandlingUrl}/${SYNLIGE_STEG.VILKÅRSVURDERING.href}`);
        } else {
            settSenderInn(true);
            const payload: ForeldelseStegPayload = {
                '@type': 'FORELDELSE',
                foreldetPerioder: skjemaData.map<PeriodeForeldelseStegPayload>(per => {
                    const erForeldelse =
                        per.foreldelsesvurderingstype === Foreldelsevurdering.Foreldet;
                    const erTilleggsfrist =
                        per.foreldelsesvurderingstype === Foreldelsevurdering.Tilleggsfrist;
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
            sendInnForeldelse(behandling.behandlingId, payload).then((respons: Ressurs<string>) => {
                settSenderInn(false);
                if (respons.status === RessursStatus.Suksess) {
                    queryClient.invalidateQueries({
                        queryKey: [
                            'hentBehandling',
                            { path: { behandlingId: behandling.behandlingId } },
                        ],
                    });
                    navigate(
                        `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                    );
                }
            });
        }
    };

    return {
        foreldelse,
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
    };
});

export { ForeldelseProvider, useForeldelse };
