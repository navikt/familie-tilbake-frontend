import type { AkselColor } from '@navikt/ds-react/types/theme';
import type { InnloggetRolleEnum } from '@/generated';
import type { Rolle } from '@/generated-new';

type FellesRolle = Extract<`${InnloggetRolleEnum}`, `${Rolle}`>;

export type RolleTag = { label: string; dataColor: AkselColor };

export const baseRolleTag: Record<FellesRolle, RolleTag> = {
    SAKSBEHANDLER: { label: 'Saksbehandler', dataColor: 'info' },
    BESLUTTER: { label: 'Beslutter', dataColor: 'meta-purple' },
};
