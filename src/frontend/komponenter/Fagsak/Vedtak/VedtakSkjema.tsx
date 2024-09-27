import * as React from 'react';

import { styled } from 'styled-components';

import { Alert, Heading } from '@navikt/ds-react';

import AvsnittSkjema, { avsnittKey } from './AvsnittSkjema';
import { AvsnittSkjemaData } from './typer/feilutbetalingVedtak';

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
    erLikePerioder: boolean;
}

const VedtakSkjema: React.FC<IProps> = ({
    avsnitter,
    erLesevisning,
    erRevurderingBortfaltBeløp,
    harBrukerUttaltSeg,
    // erLikePerioder,
}) => {
    React.useEffect(() => {
        console.log('avsnitter', avsnitter);
    }, [avsnitter]);
    return (
        <StyledSkjema>
            <Heading size="small" level="2" spacing>
                Vedtaksbrev
            </Heading>
            {harBrukerUttaltSeg && !erLesevisning && (
                <StyledAlert variant={'warning'}>Husk å vurdere uttalelse fra bruker</StyledAlert>
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
