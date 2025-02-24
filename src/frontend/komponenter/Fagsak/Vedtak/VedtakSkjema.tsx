import type { AvsnittSkjemaData } from './typer/feilutbetalingVedtak';

import { Alert, Heading } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import AvsnittSkjema, { avsnittKey } from './AvsnittSkjema';

const StyledSkjema = styled.div`
    width: 90%;
`;
const StyledAlert = styled(Alert)`
    margin-bottom: 1.5rem;
`;

interface IProps {
    avsnitter: AvsnittSkjemaData[];
    erLesevisning: boolean;
    erRevurderingBortfaltBeløp: boolean;
    harBrukerUttaltSeg: boolean;
}

const VedtakSkjema: React.FC<IProps> = ({
    avsnitter,
    erLesevisning,
    erRevurderingBortfaltBeløp,
    harBrukerUttaltSeg,
}) => {
    return (
        <StyledSkjema>
            <Heading size="small" level="2" spacing>
                Vedtaksbrev
            </Heading>
            {harBrukerUttaltSeg && !erLesevisning && (
                <StyledAlert variant="warning">Husk å vurdere uttalelse fra bruker</StyledAlert>
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
        </StyledSkjema>
    );
};

export default VedtakSkjema;
