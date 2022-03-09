import * as React from 'react';

import styled from 'styled-components';

import { Undertittel } from 'nav-frontend-typografi';

import { Spacer8 } from '../../Felleskomponenter/Flytelementer';
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
            <Undertittel>Vedtaksbrev</Undertittel>
            <Spacer8 />
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
