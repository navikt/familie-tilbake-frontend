import type { FC } from 'react';

import { Textarea } from '@navikt/ds-react';

import { SærligeGrunner } from '../SærligeGrunner';
import { Under4xRettsgebyr } from '../Under4xRettsgebyr';

type Props = {
    erUnder4xRettsgebyr: boolean;
};

export const Uaktsom: FC<Props> = ({ erUnder4xRettsgebyr }: Props) => {
    return (
        <>
            <Textarea
                label="Begrunn hvorfor du vurderer at mottakeren har handlet uaktsomt"
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            {erUnder4xRettsgebyr ? <Under4xRettsgebyr reduksjon /> : <SærligeGrunner reduksjon />}
        </>
    );
};
