import type { AxiosError } from 'axios';
import type { FC } from 'react';
import type { Error as ApiFeil } from '@/generated-new';

import { LocalAlert } from '@navikt/ds-react';

type Props = {
    feil: AxiosError<ApiFeil>;
    standardTittel: string;
    standardMelding: string;
};

export const FeilVarsel: FC<Props> = ({ feil, standardTittel, standardMelding }: Props) => (
    <LocalAlert status="error" size="small">
        <LocalAlert.Header>
            <LocalAlert.Title>{feil.response?.data?.tittel ?? standardTittel}</LocalAlert.Title>
        </LocalAlert.Header>
        <LocalAlert.Content>{feil.response?.data?.melding ?? standardMelding}</LocalAlert.Content>
    </LocalAlert>
);
