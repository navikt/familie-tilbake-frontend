import type { AvsnittSkjemaData } from './typer/vedtak';

import { useBehandlingState } from '@context/BehandlingStateContext';
import { Alert, Heading } from '@navikt/ds-react';
import * as React from 'react';

import { AvsnittSkjema, avsnittKey } from './AvsnittSkjema';

type Props = {
    avsnitter: AvsnittSkjemaData[];
    erRevurderingBortfaltBeløp: boolean;
    harBrukerUttaltSeg: boolean;
};

export const VedtakSkjema: React.FC<Props> = ({
    avsnitter,
    erRevurderingBortfaltBeløp,
    harBrukerUttaltSeg,
}) => {
    const { behandlingILesemodus } = useBehandlingState();
    return (
        <>
            <Heading size="small" level="2">
                Vedtaksbrev
            </Heading>
            {!harBrukerUttaltSeg && !behandlingILesemodus && (
                <Alert variant="warning">Husk å vurdere uttalelse fra bruker</Alert>
            )}
            {avsnitter.map(avsnitt => {
                return (
                    <AvsnittSkjema
                        key={avsnittKey(avsnitt)}
                        avsnitt={avsnitt}
                        erRevurderingBortfaltBeløp={erRevurderingBortfaltBeløp}
                    />
                );
            })}
        </>
    );
};
