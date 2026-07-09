import type { FC } from 'react';

import { Textarea } from '@navikt/ds-react';

import { SimulertBeløp } from '../SimulertBeløp';

type Props = {
    simulertBeløp: number | null;
};

export const Ingenting: FC<Props> = ({ simulertBeløp }: Props) => {
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
            <SimulertBeløp simulertBeløp={simulertBeløp} />
        </>
    );
};
