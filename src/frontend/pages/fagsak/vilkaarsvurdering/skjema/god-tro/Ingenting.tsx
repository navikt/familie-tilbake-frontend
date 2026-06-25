import type { FC } from 'react';

import { Textarea } from '@navikt/ds-react';

import { SimulertBeløp } from '../SimulertBeløp';

export const Ingenting: FC = () => {
    return (
        <>
            <Textarea
                label="Begrunn hvorfor ingenting av beløpet er i behold"
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <SimulertBeløp beløp={0} />
        </>
    );
};
