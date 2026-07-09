import type { FC } from 'react';

import { Textarea } from '@navikt/ds-react';

import { SærligeGrunner } from '../SærligeGrunner';

type Props = {
    simulertBeløp: number | null;
};

export const GrovtUaktsom: FC<Props> = ({ simulertBeløp }: Props) => {
    return (
        <>
            <Textarea
                label="Begrunn hvorfor du vurderer at mottakeren har handlet grovt uaktsomt"
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <SærligeGrunner renter reduksjon simulertBeløp={simulertBeløp} />
        </>
    );
};
