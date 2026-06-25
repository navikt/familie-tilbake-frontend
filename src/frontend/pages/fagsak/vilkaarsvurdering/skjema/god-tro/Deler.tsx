import type { FC } from 'react';

import { Textarea, TextField } from '@navikt/ds-react';

import { KrevesTilbakeVurdering } from './KrevesTilbakeVurdering';

export const Deler: FC = () => {
    return (
        <>
            <Textarea
                label="Begrunn hvorfor deler av beløpet er i behold"
                name="godTro.deler.begrunnelseIBehold"
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <TextField
                label="Hvor mange kroner er i behold?"
                name="godTro.deler.beløpIBehold"
                size="small"
                style={{ width: '100px' }}
                className="max-w-xl"
            />
            <KrevesTilbakeVurdering
                navnPrefix="godTro.deler"
                beløpsbeskrivelse="deler av beløpet"
            />
        </>
    );
};
