import type { AvsnittSkjemaData } from './typer/vedtak';

import { Alert, Heading } from '@navikt/ds-react';
import * as React from 'react';

import { AvsnittSkjema, avsnittKey } from './AvsnittSkjema';

type Props = {
    avsnitter: AvsnittSkjemaData[];
    erLesevisning: boolean;
    erRevurderingBortfaltBeløp: boolean;
    harBrukerUttaltSeg: boolean;
};

export const VedtakSkjema: React.FC<Props> = ({
    avsnitter,
    erLesevisning,
    erRevurderingBortfaltBeløp,
    harBrukerUttaltSeg,
}) => {
    return (
        <>
            <Heading size="small" level="2">
                Vedtaksbrev
            </Heading>
            {!harBrukerUttaltSeg && !erLesevisning && (
                <Alert variant="warning">Husk å vurdere uttalelse fra bruker</Alert>
            )}
            {avsnitter.map(avsnitt => {
                return (
                    <AvsnittSkjema
                        key={avsnittKey(avsnitt)}
                        avsnitt={avsnitt}
                        erLesevisning={erLesevisning}
                        erRevurderingBortfaltBeløp={erRevurderingBortfaltBeløp}
                    />
                );
            })}
        </>
    );
};
