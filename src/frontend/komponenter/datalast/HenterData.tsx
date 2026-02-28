import type { FC } from 'react';

import { BodyLong, Loader } from '@navikt/ds-react';

type Props = {
    beskrivelse: string;
    størrelse?: '2xlarge' | 'large';
};

export const HenterData: FC<Props> = ({ beskrivelse, størrelse = '2xlarge' }) => {
    return (
        <div className="p-3 text-center">
            <BodyLong>{beskrivelse}</BodyLong>
            <Loader size={størrelse} title="henter..." transparent={false} variant="neutral" />
        </div>
    );
};
