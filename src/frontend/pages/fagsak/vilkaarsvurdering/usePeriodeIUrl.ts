import type { Vilkårsperiode } from './typer';

import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { useBehandlingState } from '@/context/BehandlingStateContext';

import { finnStandardValgtPeriode } from './utils';

export const PERIODE_SØKEPARAMETER = 'periode';

type PeriodeIUrl = {
    valgtPeriode: Vilkårsperiode | undefined;
    setValgtPeriodeId: (periodeId: Vilkårsperiode['id']) => void;
};

/**
 * Holder valgt periode i URL-en, slik at periodebytte blir ekte navigasjon som fanges
 * av blockeren i UlagretDataModal, og slik at perioden kan deles via lenke.
 *
 * URL-en kanoniseres mot faktisk valgt periode. Det rydder opp i foreldede periode-IDer
 * etter oppdeling og sammenslåing, og i lenker som peker på en periode som ikke finnes.
 */
export const usePeriodeIUrl = (perioder: Vilkårsperiode[]): PeriodeIUrl => {
    const { harUlagredeData } = useBehandlingState();
    const [søkeparametre, setSøkeparametre] = useSearchParams();
    const periodeIdIUrl = søkeparametre.get(PERIODE_SØKEPARAMETER) ?? undefined;

    const valgtPeriode = useMemo(() => {
        const funnetPeriode = perioder.find(({ id }) => id === periodeIdIUrl);
        return funnetPeriode ?? finnStandardValgtPeriode(perioder);
    }, [perioder, periodeIdIUrl]);

    const skrivPeriodeTilUrl = useCallback(
        (periodeId: Vilkårsperiode['id'], erstattHistorikk: boolean): void => {
            setSøkeparametre(
                forrige => {
                    const oppdatert = new URLSearchParams(forrige);
                    oppdatert.set(PERIODE_SØKEPARAMETER, periodeId);
                    return oppdatert;
                },
                { replace: erstattHistorikk }
            );
        },
        [setSøkeparametre]
    );

    const kanoniskPeriodeId =
        valgtPeriode && valgtPeriode.id !== periodeIdIUrl ? valgtPeriode.id : undefined;

    useEffect(() => {
        /**
         * Kanonisering er opprydding brukeren ikke har bedt om, så den utsettes ved
         * ulagrede endringer for ikke å utløse advarselsmodalen. Historikken erstattes
         * slik at «tilbake» ikke fører til en periode som ikke finnes lenger.
         */
        if (kanoniskPeriodeId && !harUlagredeData) {
            skrivPeriodeTilUrl(kanoniskPeriodeId, true);
        }
    }, [kanoniskPeriodeId, harUlagredeData, skrivPeriodeTilUrl]);

    const setValgtPeriodeId = useCallback(
        (periodeId: Vilkårsperiode['id']): void => skrivPeriodeTilUrl(periodeId, false),
        [skrivPeriodeTilUrl]
    );

    return { valgtPeriode, setValgtPeriodeId };
};
