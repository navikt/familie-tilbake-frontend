import type { AvsnittSkjemaData } from './typer/vedtak';

import { Alert, Heading } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import { AvsnittSkjema, avsnittKey } from './AvsnittSkjema';
import { useBehandlingState } from '../../../context/BehandlingStateContext';

const StyledSkjema = styled.div`
    width: 90%;
`;
const StyledAlert = styled(Alert)`
    margin-bottom: 1.5rem;
`;

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
        <StyledSkjema>
            <Heading size="small" level="2" spacing>
                Vedtaksbrev
            </Heading>
            {harBrukerUttaltSeg && !behandlingILesemodus && (
                <StyledAlert variant="warning">Husk å vurdere uttalelse fra bruker</StyledAlert>
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
        </StyledSkjema>
    );
};
