import * as React from 'react';

import styled from 'styled-components';

import { BodyShort, Box, HStack, Heading, Loader, VStack } from '@navikt/ds-react';

const BoxMedMargin = styled(Box)`
    margin-top: 2rem;
`;

const HenterBehandling: React.FC = () => {
    return (
        <VStack justify="center" align="center">
            <BoxMedMargin
                background="surface-subtle"
                padding="8"
                borderRadius="large"
                borderColor="border-default"
            >
                <Heading level="1" size="medium">
                    Henter behandling
                </Heading>

                <div>
                    <BodyShort>Henting av behandlingen tar litt tid.</BodyShort>
                    <BodyShort>Vennligst vent!</BodyShort>
                </div>
                <HStack justify="center">
                    <Loader size="large" title="venter..." transparent={false} variant="neutral" />
                </HStack>
            </BoxMedMargin>
        </VStack>
    );
};

export default HenterBehandling;
