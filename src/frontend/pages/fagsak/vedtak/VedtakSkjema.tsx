import type { AvsnittSkjemaData } from './typer/vedtak';

import { Heading, LocalAlert } from '@navikt/ds-react';
import * as React from 'react';

import { useBehandlingState } from '~/context/BehandlingStateContext';

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
                <LocalAlert status="warning">
                    <LocalAlert.Content>Husk å vurdere uttalelse fra bruker</LocalAlert.Content>
                </LocalAlert>
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
