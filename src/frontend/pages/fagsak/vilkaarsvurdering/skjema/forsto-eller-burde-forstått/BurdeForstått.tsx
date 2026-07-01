import type { FC } from 'react';

import { Textarea } from '@navikt/ds-react';

import { SærligeGrunner } from '../SærligeGrunner';

export const BurdeForstått: FC = () => {
    return (
        <>
            <Textarea
                label="Begrunn hvorfor du vurderer at mottakeren burde forstått at utbetalingen skyldtes en feil"
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <SærligeGrunner reduksjon />
        </>
    );
};
