import * as React from 'react';

import styled from 'styled-components';

import { Sidetittel } from 'nav-frontend-typografi';

import { Spacer20 } from './Flytelementer';

const StyledContainer = styled.div`
    padding: 10px;
`;

const Dashboard: React.FC = () => (
    <StyledContainer>
        <Sidetittel>NAV Familie - Tilbakekreving</Sidetittel>
        <Spacer20 />
        <div>
            Velkommen til saksbehandlingsløsningen for tilbakekreving av ytelsene Barnetrygd,
            Konstantstøtte og Støtte til enslig forsørger.
        </div>
    </StyledContainer>
);

export default Dashboard;
