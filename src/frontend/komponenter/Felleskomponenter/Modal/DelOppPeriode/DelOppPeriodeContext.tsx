import type { IBeregnSplittetPeriodeRespons, Periode } from '../../../../typer/feilutbetalingtyper';
import type { TimelinePeriodProps } from '@navikt/ds-react';

import { useState } from 'react';

import { useHttp } from '../../../../api/http/HttpProvider';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';
import { getEndOfMonthISODateStr, validerDato } from '../../../../utils';

interface Props {
    visModal: boolean;
    settVisModal: (vis: boolean) => void;
    splittDato: string;
    settSplittDato: (dato: string) => void;
    tidslinjeRader: TimelinePeriodProps[][] | undefined;
    settTidslinjeRader: (rader: TimelinePeriodProps[][]) => void;
    feilmelding: string;
    vedDatoEndring: (splittPeriode: (månedsslutt: string) => void, nyVerdi?: string) => void;
    sendInnSkjema: (
        payload: Periode[],
        behandleRespons: (response: IBeregnSplittetPeriodeRespons) => void
    ) => void;
    validateNyPeriode: (periode: Periode, månedsslutt: string) => boolean;
}

export const useDelOppPeriode = (fom: string, behandlingId: string): Props => {
    const [visModal, settVisModal] = useState(false);
    const [splittDato, settSplittDato] = useState(fom);
    const [tidslinjeRader, settTidslinjeRader] = useState<TimelinePeriodProps[][]>();
    const [feilmelding, settFeilmelding] = useState('');
    const { request } = useHttp();

    const vedDatoEndring = (
        splittPeriode: (månedsslutt: string) => void,
        nyVerdi?: string
    ): void => {
        const feilmelding = validerDato(nyVerdi);
        if (feilmelding) {
            settFeilmelding(feilmelding);
        } else {
            settFeilmelding('');
            const månedsslutt = getEndOfMonthISODateStr(nyVerdi);
            if (nyVerdi && månedsslutt) {
                splittPeriode(månedsslutt);
                settSplittDato(månedsslutt);
            }
        }
    };

    const sendInnSkjema = (
        payload: Periode[],
        behandleRespons: (response: IBeregnSplittetPeriodeRespons) => void
    ): void => {
        request<Periode[], IBeregnSplittetPeriodeRespons>({
            method: 'POST',
            url: `/familie-tilbake/api/behandling/${behandlingId}/beregn/v1`,
            data: payload,
        }).then((response: Ressurs<IBeregnSplittetPeriodeRespons>) => {
            if (response.status === RessursStatus.Suksess) {
                behandleRespons(response.data);
                settVisModal(false);
                settSplittDato('');
                settTidslinjeRader([]);
            }
        });
    };

    const validateNyPeriode = (periode: Periode, månedsslutt: string): boolean => {
        if (periode.fom > månedsslutt || månedsslutt >= periode.tom) {
            settFeilmelding('t.o.m. måned er utenfor perioden');
            return false;
        }
        return true;
    };

    return {
        visModal,
        settVisModal,
        splittDato,
        settSplittDato,
        tidslinjeRader,
        settTidslinjeRader,
        feilmelding,
        vedDatoEndring,
        sendInnSkjema,
        validateNyPeriode,
    };
};
