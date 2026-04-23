import type { TimelinePeriodProps } from '@navikt/ds-react';
import type { BeregnSplittetPeriodeRespons, Periode } from '~/typer/tilbakekrevingstyper';

import { useState } from 'react';

import { useHttp } from '~/api/http/HttpProvider';
import { useBehandling } from '~/context/BehandlingContext';
import { type Ressurs, RessursStatus } from '~/typer/ressurs';
import { getEndOfMonthISODateStr, validerDato } from '~/utils';

type DelOppPeriodeHook = {
    visModal: boolean;
    setVisModal: (vis: boolean) => void;
    splittDato: string;
    setSplittDato: (dato: string) => void;
    tidslinjeRader: TimelinePeriodProps[][] | undefined;
    setTidslinjeRader: (rader: TimelinePeriodProps[][]) => void;
    feilmelding: string;
    vedDatoEndring: (splittPeriode: (månedsslutt: string) => void, nyVerdi?: string) => void;
    sendInnSkjema: (
        payload: Periode[],
        behandleRespons: (response: BeregnSplittetPeriodeRespons) => void
    ) => void;
    validateNyPeriode: (periode: Periode, månedsslutt: string) => boolean;
};

export const useDelOppPeriode = (fom: string): DelOppPeriodeHook => {
    const { behandlingId } = useBehandling();
    const [visModal, setVisModal] = useState(false);
    const [splittDato, setSplittDato] = useState(fom);
    const [tidslinjeRader, setTidslinjeRader] = useState<TimelinePeriodProps[][]>();
    const [feilmelding, setFeilmelding] = useState('');
    const { request } = useHttp();

    const vedDatoEndring = (
        splittPeriode: (månedsslutt: string) => void,
        nyVerdi?: string
    ): void => {
        const feilmelding = validerDato(nyVerdi);
        if (feilmelding) {
            setFeilmelding(feilmelding);
        } else {
            setFeilmelding('');
            const månedsslutt = getEndOfMonthISODateStr(nyVerdi);
            if (nyVerdi && månedsslutt) {
                splittPeriode(månedsslutt);
                setSplittDato(månedsslutt);
            }
        }
    };

    const sendInnSkjema = (
        payload: Periode[],
        behandleRespons: (response: BeregnSplittetPeriodeRespons) => void
    ): void => {
        request<Periode[], BeregnSplittetPeriodeRespons>({
            method: 'POST',
            url: `/familie-tilbake/api/behandling/${behandlingId}/beregn/v1`,
            data: payload,
        }).then((response: Ressurs<BeregnSplittetPeriodeRespons>) => {
            if (response.status === RessursStatus.Suksess) {
                behandleRespons(response.data);
                setVisModal(false);
                setSplittDato('');
                setTidslinjeRader([]);
            }
        });
    };

    const validateNyPeriode = (periode: Periode, månedsslutt: string): boolean => {
        if (periode.fom > månedsslutt || månedsslutt >= periode.tom) {
            setFeilmelding('t.o.m. måned er utenfor perioden');
            return false;
        }
        return true;
    };

    return {
        visModal,
        setVisModal,
        splittDato,
        setSplittDato,
        tidslinjeRader,
        setTidslinjeRader,
        feilmelding,
        vedDatoEndring,
        sendInnSkjema,
        validateNyPeriode,
    };
};
