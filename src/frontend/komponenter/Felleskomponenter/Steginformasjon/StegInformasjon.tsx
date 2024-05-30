import * as React from 'react';

import { styled } from 'styled-components';

import { Alert, BodyShort, Label } from '@navikt/ds-react';

const StyledDiv = styled.div`
    p {
        display: inline;
    }
`;

const StyledAlert = styled(Alert)`
    & .navds-alert__wrapper {
        max-width: 100%;
    }
`;

interface IProps {
    behandletSteg: boolean;
    infotekst: string;
}

const Steginformasjon: React.FC<IProps> = ({ behandletSteg, infotekst }) => {
    return !behandletSteg ? (
        <StyledAlert variant="info" size={'small'} children={infotekst} />
    ) : (
        <StyledDiv>
            <Label size="small">Behandlet:</Label> <BodyShort size="small">{infotekst}</BodyShort>
        </StyledDiv>
    );
};

export default Steginformasjon;
