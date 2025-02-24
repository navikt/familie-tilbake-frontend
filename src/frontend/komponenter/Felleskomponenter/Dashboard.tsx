import { BodyLong, Heading } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

const StyledContainer = styled.div`
    padding: 10px;
`;

const Dashboard: React.FC = () => (
    <StyledContainer>
        <Heading level="1" size="xlarge" spacing>
            Nav - Tilbakekreving
        </Heading>
        <BodyLong size="small">
            Velkommen til saksbehandlingsløsningen for tilbakekreving av ytelsene Barnetrygd,
            Konstantstøtte og Støtte til enslig forsørger.
        </BodyLong>
    </StyledContainer>
);

export default Dashboard;
