import type { EndretPeriode, FaktaPeriode } from '@/generated-new';

import { add, addDays, format, intervalToDuration, parseISO } from 'date-fns';

import { hentPeriodelengde } from '@/utils';

export type PeriodeKortData = {
    fom: string;
    tom: string;
    beløp: number;
};

export type ModalTekst = {
    tittel: string;
    beskrivelse: string;
};

export const hentVarighetsendring = (periode: EndretPeriode): string | null => {
    // Sammenlign kalenderlengdene fra samme startdato for å bevare hele måneder og år.
    const fellesStart = parseISO('2000-01-01');
    const gammelSlutt = add(
        fellesStart,
        intervalToDuration({
            start: parseISO(periode.gammelPeriode.fom),
            end: addDays(parseISO(periode.gammelPeriode.tom), 1),
        })
    );
    const nySlutt = add(
        fellesStart,
        intervalToDuration({
            start: parseISO(periode.fom),
            end: addDays(parseISO(periode.tom), 1),
        })
    );
    if (gammelSlutt.getTime() === nySlutt.getTime()) {
        return null;
    }
    const erKortere = nySlutt < gammelSlutt;
    const start = erKortere ? nySlutt : gammelSlutt;
    const slutt = erKortere ? gammelSlutt : nySlutt;
    const endring = hentPeriodelengde(
        format(start, 'yyyy-MM-dd'),
        format(addDays(slutt, -1), 'yyyy-MM-dd')
    );
    return `${erKortere ? '–' : '+'}${endring}`;
};

const periodeFrase = (antall: number, erNyPeriode: boolean = false): string =>
    antall === 1
        ? `en ${erNyPeriode ? 'ny ' : ''}periode`
        : `flere ${erNyPeriode ? 'nye ' : ''}perioder`;

export const hentModalTekst = (
    antallNyePerioder: number,
    antallEndredePerioder: number,
    antallFjernedePerioder: number
): ModalTekst => {
    const harNyePerioder = antallNyePerioder > 0;
    const harEndretPerioder = antallEndredePerioder > 0;
    const harFjernedePerioder = antallFjernedePerioder > 0;

    if (harFjernedePerioder && !harNyePerioder && !harEndretPerioder) {
        return {
            tittel:
                antallFjernedePerioder > 1 ? 'Flere perioder er fjernet' : 'En periode er fjernet',
            beskrivelse: `Det er registrert at ${periodeFrase(antallFjernedePerioder)} er fjernet i kravgrunnlaget, og du må vurdere på nytt.`,
        };
    }
    if (harNyePerioder && !harFjernedePerioder && !harEndretPerioder) {
        return {
            tittel: antallNyePerioder > 1 ? 'Nye perioder må vurderes' : 'Ny periode må vurderes',
            beskrivelse: `Det er registrert ${periodeFrase(antallNyePerioder, true)} i kravgrunnlaget som må vurderes.`,
        };
    }
    return {
        tittel: 'Endringer i kravgrunnlaget',
        beskrivelse: 'Det er registrert endringer i kravgrunnlaget som må vurderes på nytt.',
    };
};

export const hentUendredePerioder = (
    perioder: FaktaPeriode[],
    endringer: Array<{
        fom: string;
        tom: string;
        gammelPeriode?: { fom: string; tom: string };
    }>
): PeriodeKortData[] =>
    perioder
        .filter(
            periode =>
                !periode.endringIKravgrunnlag &&
                !periode.splittbarePerioder.some(delperiode => delperiode.endringIKravgrunnlag) &&
                !endringer.some(
                    endring =>
                        (periode.fom <= endring.tom && periode.tom >= endring.fom) ||
                        (endring.gammelPeriode &&
                            periode.fom <= endring.gammelPeriode.tom &&
                            periode.tom >= endring.gammelPeriode.fom)
                )
        )
        .map(periode => ({
            fom: periode.fom,
            tom: periode.tom,
            beløp: periode.feilutbetaltBeløp,
        }));
