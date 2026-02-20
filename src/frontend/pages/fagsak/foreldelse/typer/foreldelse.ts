import type { Foreldelsevurdering } from '@kodeverk';
import type { PeriodeSkjemaData } from '@typer/periodeSkjemaData';
import type { IsoDatoString } from '@utils/dato';

export interface ForeldelsePeriodeSkjemeData extends PeriodeSkjemaData {
    foreldelsesvurderingstype?: Foreldelsevurdering;
    begrunnelse?: string;
    foreldelsesfrist?: IsoDatoString;
    oppdagelsesdato?: IsoDatoString;
}
