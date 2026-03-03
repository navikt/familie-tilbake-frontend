import type { AvsnittSkjemaData } from './typer/vedtak';
import type { FC } from 'react';

import { Heading, LocalAlert } from '@navikt/ds-react';

import { useBehandlingState } from '~/context/BehandlingStateContext';

import { AvsnittSkjema, avsnittKey } from './AvsnittSkjema';

type Props = {
    avsnitter: AvsnittSkjemaData[];
    erRevurderingBortfaltBeløp: boolean;
    harBrukerUttaltSeg: boolean;
};

export const VedtakSkjema: FC<Props> = ({
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
            {harBrukerUttaltSeg && !behandlingILesemodus && (
                <LocalAlert status="warning">
                    <LocalAlert.Header>
                        <LocalAlert.Title>Husk å vurdere uttalelse fra bruker</LocalAlert.Title>
                    </LocalAlert.Header>
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
