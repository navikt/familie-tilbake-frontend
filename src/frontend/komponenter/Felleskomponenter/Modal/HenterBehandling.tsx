import * as React from 'react';

import { BodyShort, Box, HStack, Heading, Loader, VStack } from '@navikt/ds-react';

const HenterBehandling: React.FC = () => {
    return (
        <>
            <VStack justify="center" align="center">
                <Box
                    background="surface-subtle"
                    padding="8"
                    borderRadius="large"
                    borderColor="border-default"
                    style={{ marginTop: '2rem' }}
                >
                    <Heading level="1" size="medium">
                        Henter behandling
                    </Heading>

                    <div>
                        <BodyShort>Henting av behandlingen tar litt tid.</BodyShort>
                        <BodyShort>Vennligst vent!</BodyShort>
                    </div>
                    <HStack justify="center">
                        <Loader
                            size="large"
                            title="venter..."
                            transparent={false}
                            variant="neutral"
                        />
                    </HStack>
                </Box>
            </VStack>
        </>
    );
};

export default HenterBehandling;
