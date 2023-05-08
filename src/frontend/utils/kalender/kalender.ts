import { parseIso8601String } from './io';
import type { DagMånedÅr, FamilieIsoDate } from './typer';

export const kalenderDiff = (første: Date, andre: Date) => {
    return første.getTime() - andre.getTime();
};

export const kalenderDato = (dato: FamilieIsoDate): DagMånedÅr => parseIso8601String(dato);

export const kalenderDatoFraDate = (date: Date): DagMånedÅr => ({
    dag: date.getDate(),
    måned: date.getMonth(),
    år: date.getFullYear(),
});

export const kalenderDatoTilDate = (
    dagMånedÅr: DagMånedÅr,
    timer?: number,
    minutter?: number
): Date =>
    new Date(
        dagMånedÅr.år,
        dagMånedÅr.måned,
        dagMånedÅr.dag,
        timer ? timer : 0,
        minutter ? minutter : 0
    );

export const iDag = (): DagMånedÅr => kalenderDatoFraDate(new Date());
