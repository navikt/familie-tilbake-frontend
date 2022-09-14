import * as React from 'react';

import { useHttp } from '@navikt/familie-http';
import { type Periode as TidslinjePeriode } from '@navikt/familie-tidslinje';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { IBeregnSplittetPeriodeRespons, Periode } from '../../../../typer/feilutbetalingtyper';
import { getEndOfMonthISODateStr, validerDato } from '../../../../utils';

export const useDelOppPeriode = (tom: string, behandlingId: string) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const [splittDato, settSplittDato] = React.useState<string>(tom);
    const [tidslinjeRader, settTidslinjeRader] = React.useState<TidslinjePeriode[][]>();
    const [feilmelding, settFeilmelding] = React.useState<string>();
    const { request } = useHttp();

    const vedDatoEndring = (splittPeriode: (månedsslutt: string) => void, nyVerdi?: string) => {
        const feilmelding = validerDato(nyVerdi);
        if (feilmelding) {
            settFeilmelding(feilmelding);
        } else {
            settFeilmelding(undefined);
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
    ) => {
        request<Periode[], IBeregnSplittetPeriodeRespons>({
            method: 'POST',
            url: `/familie-tilbake/api/behandling/${behandlingId}/beregn/v1`,
            data: payload,
        }).then((response: Ressurs<IBeregnSplittetPeriodeRespons>) => {
            if (response.status === RessursStatus.SUKSESS) {
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
