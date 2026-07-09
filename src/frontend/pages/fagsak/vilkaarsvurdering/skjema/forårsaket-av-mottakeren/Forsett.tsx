import type { FC } from 'react';

import { Textarea } from '@navikt/ds-react';

import { SimulertBeløp } from '../SimulertBeløp';

type Props = {
    simulertBeløp: number | null;
};

export const Forsett: FC<Props> = ({ simulertBeløp }: Props) => {
    return (
        <>
            <Textarea
                label="Begrunn hvorfor du vurderer at mottakeren har handlet med forsett"
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <SimulertBeløp renter simulertBeløp={simulertBeløp} />
        </>
    );
};
