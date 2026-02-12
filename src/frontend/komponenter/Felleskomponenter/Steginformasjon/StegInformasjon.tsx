import { Alert, BodyShort, Label } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

const StyledDiv = styled.div`
    p {
        display: inline;
    }
`;

const StyledAlert = styled(Alert)`
    & .aksel-alert__wrapper {
        max-width: 100%;
    }
`;

type Props = {
    behandletSteg: boolean;
    infotekst: string;
};

export const Steginformasjon: React.FC<Props> = ({ behandletSteg, infotekst }) => {
    return !behandletSteg ? (
        <StyledAlert variant="info" size="small">
            {infotekst}
        </StyledAlert>
    ) : (
        <StyledDiv>
            <Label size="small">Behandlet:</Label> <BodyShort size="small">{infotekst}</BodyShort>
        </StyledDiv>
    );
};
