import { BodyShort, Box, HStack, Heading, Loader, VStack } from '@navikt/ds-react';
import * as React from 'react';
import styled from 'styled-components';

const BoxMedMargin = styled(Box)`
    margin-top: 2rem;
`;

const HenterBehandling: React.FC = () => {
    return (
        <VStack justify="center" align="center">
            <BoxMedMargin
                padding="8"
                borderRadius="large"
                className="border border-ax-border-neutral-subtle"
            >
                <Heading level="1" size="medium" spacing>
                    Henter behandling
                </Heading>

                <BodyShort>Henting av behandlingen tar litt tid.</BodyShort>
                <BodyShort spacing>Vennligst vent!</BodyShort>

                <HStack justify="center">
                    <Loader size="large" title="venter..." transparent={false} variant="neutral" />
                </HStack>
            </BoxMedMargin>
        </VStack>
    );
};

export default HenterBehandling;
