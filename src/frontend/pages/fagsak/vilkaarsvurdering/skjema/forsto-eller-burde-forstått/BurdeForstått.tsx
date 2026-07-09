import type { FC } from 'react';

import { Textarea } from '@navikt/ds-react';

import { SærligeGrunner } from '../SærligeGrunner';
import { Under4xRettsgebyr } from '../Under4xRettsgebyr';

type Props = {
    erUnder4xRettsgebyr: boolean;
    simulertBeløp: number | null;
};

export const BurdeForstått: FC<Props> = ({ erUnder4xRettsgebyr, simulertBeløp }: Props) => {
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
            {erUnder4xRettsgebyr ? (
                <Under4xRettsgebyr reduksjon simulertBeløp={simulertBeløp} />
            ) : (
                <SærligeGrunner reduksjon simulertBeløp={simulertBeløp} />
            )}
        </>
    );
};
