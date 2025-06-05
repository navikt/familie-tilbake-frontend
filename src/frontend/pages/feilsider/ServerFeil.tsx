import { BodyShort, Box, HGrid, Heading, Link, Page, VStack } from '@navikt/ds-react';
import * as React from 'react';

interface IProps {
    statusKode?: number;
    frontendFeilmelding?: string;
}

const ServerFeil: React.FC<IProps> = ({ statusKode, frontendFeilmelding }) => {
    console.log('frontendFeilmelding', frontendFeilmelding);
    return (
        <Page.Block as="main" width="xl" gutters>
            <Box paddingBlock="20 8">
                <HGrid columns="minmax(auto,600px)" data-aksel-template="500-v2">
                    <VStack gap="16">
                        <VStack align="start">
                            {!!statusKode && (
                                <BodyShort textColor="subtle" size="small">
                                    Statuskode {statusKode}
                                </BodyShort>
                            )}
                            <Heading level="1" size="large" spacing>
                                Beklager, noe gikk galt.
                            </Heading>
                            <BodyShort spacing>{frontendFeilmelding}</BodyShort>
                            <BodyShort>
                                Du kan prøve å vente noen minutter og{' '}
                                <Link href="#" onClick={() => location.reload()}>
                                    laste siden på nytt
                                </Link>
                                .
                            </BodyShort>
                        </VStack>
                    </VStack>
                </HGrid>
            </Box>
        </Page.Block>
    );
};

export default ServerFeil;
