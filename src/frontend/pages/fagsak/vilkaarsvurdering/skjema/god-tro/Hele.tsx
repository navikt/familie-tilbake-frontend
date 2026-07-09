import type { FC } from 'react';

import { Textarea } from '@navikt/ds-react';

import { KrevesTilbakeVurdering } from './KrevesTilbakeVurdering';

type Props = {
    simulertBeløp: number | null;
};

export const Hele: FC<Props> = ({ simulertBeløp }: Props) => {
    return (
        <>
            <Textarea
                label="Begrunn hvorfor hele beløpet er i behold"
                name="godTro.hele.begrunnelseIBehold"
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <KrevesTilbakeVurdering
                navnPrefix="godTro.hele"
                beløpsbeskrivelse="hele beløpet"
                simulertBeløp={simulertBeløp}
            />
        </>
    );
};
