import { Foreldelsevurdering } from '../../../../kodeverk';
import { IPeriodeSkjemaData } from '../../../../typer/periodeSkjemaData';

export interface ForeldelsePeriodeSkjemeData extends IPeriodeSkjemaData {
    foreldelsesvurderingstype?: Foreldelsevurdering;
    begrunnelse?: string;
    foreldelsesfrist?: string;
    oppdagelsesdato?: string;
}
