import type { FC } from 'react';

import { Textarea } from '@navikt/ds-react';

import { SimulertBeløp } from '../SimulertBeløp';

export const Forsett: FC = () => {
    return (
        <>
            <Textarea
                label="Begrunn hvorfor du vurderer at mottaker har handlet med forsett"
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <SimulertBeløp renter beløp={10000} />
        </>
    );
};
