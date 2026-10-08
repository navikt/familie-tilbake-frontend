import type { EndretPeriode, FaktaPeriode } from '@/generated-new';

import { add, addDays, format, intervalToDuration, parseISO } from 'date-fns';

import { hentPeriodelengde } from '@/utils';

/**
 * Finner endringen i varighet mellom gammel og ny periode, f.eks. «+2 måneder» eller «–1 dag».
 *
 * Måneder har ulikt antall dager, så varighetene kan ikke sammenlignes direkte.
 * Februar og mars er begge «1 måned», men 28 og 31 dager. Begge varighetene legges
 * derfor til en felles startdato, og differansen mellom sluttdatoene brukes.
 *
 * @returns Endringen med fortegn, eller `null` hvis varigheten er uendret.
 */
export const hentVarighetsendring = (periode: EndretPeriode): string | null => {
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

export type ModalTekst = {
    tittel: string;
    beskrivelse: string;
};

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

export type PeriodeKortData = {
    fom: string;
    tom: string;
    beløp: number;
};

type Periode = { fom: string; tom: string };

const overlapper = (a: Periode, b: Periode): boolean => a.fom <= b.tom && a.tom >= b.fom;

/**
 * Finner periodene i kravgrunnlaget som ikke berøres av noen endring, til boksen «Ingen endringer».
 *
 * Fakta gjelder fortsatt det gamle kravgrunnlaget mens modalen vises, så periodene sammenlignes
 * med endringene i det nye. En periode regnes som endret hvis den overlapper med den nye
 * perioden eller med `gammelPeriode`. Overlapp med `gammelPeriode` trengs fordi fakta
 * fortsatt har de gamle datoene for perioder som er flyttet eller forkortet.
 */
export const hentUendredePerioder = (
    perioder: FaktaPeriode[],
    endringer: Array<Periode & { gammelPeriode?: Periode }>
): PeriodeKortData[] =>
    perioder
        .filter(
            periode =>
                !endringer.some(
                    endring =>
                        overlapper(periode, endring) ||
                        (endring.gammelPeriode !== undefined &&
                            overlapper(periode, endring.gammelPeriode))
                )
        )
        .map(periode => ({
            fom: periode.fom,
            tom: periode.tom,
            beløp: periode.feilutbetaltBeløp,
        }));
