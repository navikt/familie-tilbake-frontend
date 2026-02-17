import { BodyShort, Box, Heading, Link as DsLink, Page, VStack } from '@navikt/ds-react';
import * as React from 'react';
import { Link } from 'react-router';

export const IkkeFunnet: React.FC = () => {
    return (
        <Page.Block width="xl" gutters>
            <Box paddingBlock="space-80 space-64" data-aksel-template="404-v2">
                <VStack gap="space-48" align="start">
                    <div>
                        <BodyShort textColor="subtle" size="small">
                            Statuskode 404
                        </BodyShort>
                        <Heading size="large" spacing>
                            Beklager, vi fant ikke siden
                        </Heading>
                        <BodyShort>
                            Denne siden kan være slettet eller flyttet, eller det er en feil i
                            lenken.
                        </BodyShort>
                    </div>
                    <DsLink as={Link} to="/">
                        Gå til forsiden
                    </DsLink>
                </VStack>
            </Box>
        </Page.Block>
    );
};
