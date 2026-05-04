import type { ForeldelsesvurderingstypeEnum } from '~/generated/types.gen';
import type { PeriodeSkjemaData } from '~/typer/periodeSkjemaData';
import type { IsoDatoString } from '~/utils/dato';

export interface ForeldelsePeriodeSkjemeData extends PeriodeSkjemaData {
    foreldelsesvurderingstype?: ForeldelsesvurderingstypeEnum;
    begrunnelse?: string;
    foreldelsesfrist?: IsoDatoString;
    oppdagelsesdato?: IsoDatoString;
}
