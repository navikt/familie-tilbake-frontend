import type { Foreldelsevurdering } from '../../../../kodeverk';
import type { IPeriodeSkjemaData } from '../../../../typer/periodeSkjemaData';
import type { IsoDatoString } from '../../../../utils/dato';

export interface ForeldelsePeriodeSkjemeData extends IPeriodeSkjemaData {
    foreldelsesvurderingstype?: Foreldelsevurdering;
    begrunnelse?: string;
    foreldelsesfrist?: IsoDatoString;
    oppdagelsesdato?: IsoDatoString;
}
