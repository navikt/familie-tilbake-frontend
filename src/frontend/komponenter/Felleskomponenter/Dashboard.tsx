import * as React from 'react';

import styled from 'styled-components';

const StyledContainer = styled.div`
    padding: 10px;
`;

const Dashboard: React.FC = () => (
    <StyledContainer>
        <h2>NAV Familie - Tilbakekreving</h2>
        <div>
            Velkommen til saksbehandlingsløsningen for tilbakekreving av ytelsene Barnetrygd,
            Konstantstøtte og Støtte til enslig forsørger.
        </div>
    </StyledContainer>
);

export default Dashboard;
