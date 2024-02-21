import { Foreldelsevurdering } from '../../../../kodeverk';
import { IPeriodeSkjemaData } from '../../../../typer/periodeSkjemaData';
import { IsoDatoString } from '../../../../utils/dato';

export interface ForeldelsePeriodeSkjemeData extends IPeriodeSkjemaData {
    foreldelsesvurderingstype?: Foreldelsevurdering;
    begrunnelse?: string;
    foreldelsesfrist?: IsoDatoString;
    oppdagelsesdato?: string;
}
