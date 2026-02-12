import { BodyLong, Heading } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

const StyledContainer = styled.div`
    padding: 10px;
`;

export const Dashboard: React.FC = () => (
    <StyledContainer>
        <Heading level="1" size="xlarge" spacing>
            Nav - Tilbakekreving
        </Heading>
        <BodyLong size="small">
            Velkommen til felles saksbehandlingsløsning for tilbakekreving. Dette gjelder ytelsene
            barnetrygd, kontantstøtte, enslig forsørger, tilleggsstønader og
            arbeidsavklaringspenger. Flere ytelser vil komme senere.
        </BodyLong>
    </StyledContainer>
);
