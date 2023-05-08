import dayjs from 'dayjs';

import { datoformat } from '../formatter';
import type { DagMånedÅr, FamilieIsoDate } from './typer';
import { antallDagerIMåned } from './typer';

export const parseIso8601String = (dato: FamilieIsoDate): DagMånedÅr => {
    const dayjsDato = dayjs(dato, datoformat.ISO_DAG);

    // Dayjs brukes ikke til noe annet enn å fange ugyldige inputs
    if (!dayjsDato.isValid()) {
        throw new Error(`Dato '${dato}' er ugyldig`);
    }

    const år: number = parseInt(dato.substr(0, 4), 10);
    const måned: number = parseInt(dato.substr(5, 7), 10);
    const dag: number = parseInt(dato.substr(8, 10), 10);
    const logDato = dato.substr(0, 10);

    if (år < 1800 || år > 2500) {
        throw new Error(`År fra dato '${logDato}' er '${år}' og er sannsynligvis feil`);
    }

    if (måned < 1 || måned > 12) {
        throw new Error(`Måned fra dato '${logDato}' er '${måned}' og er sannsynligvis feil`);
    }

    if (dag < 1 || dag > antallDagerIMåned({ år, måned: måned - 1 })) {
        throw new Error(`Dag fra dato '${logDato}' er '${dag}' og er sannsynligvis feil`);
    }

    return {
        dag,
        måned: måned - 1,
        år,
    };
};