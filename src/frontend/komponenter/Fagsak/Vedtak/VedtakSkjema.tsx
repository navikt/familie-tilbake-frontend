import * as React from 'react';

import { styled } from 'styled-components';

import { Heading } from '@navikt/ds-react';

import AvsnittSkjema, { avsnittKey } from './AvsnittSkjema';
import { AvsnittSkjemaData } from './typer/feilutbetalingVedtak';

const StyledSkjema = styled.div`
    width: 90%;
`;

interface IProps {
    avsnitter: AvsnittSkjemaData[];
    erLesevisning: boolean;
    erRevurderingBortfaltBeløp: boolean;
}

const VedtakSkjema: React.FC<IProps> = ({
    avsnitter,
    erLesevisning,
    erRevurderingBortfaltBeløp,
}) => {
    return (
        <StyledSkjema>
            <Heading size="small" level="2" spacing>
                Vedtaksbrev
            </Heading>
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
