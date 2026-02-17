import { BodyShort, Box, Button, Heading, Page, VStack } from '@navikt/ds-react';
import * as React from 'react';

export const IkkeTilgang: React.FC = () => {
    return (
        <Page.Block width="xl" gutters>
            <Box paddingBlock="space-80 space-64" data-aksel-template="403-v2">
                <VStack gap="space-48" align="start">
                    <div>
                        <BodyShort textColor="subtle" size="small">
                            Statuskode 401
                        </BodyShort>
                        <Heading size="large" spacing>
                            Sesjonen din har utløpt
                        </Heading>
                        <BodyShort spacing>
                            Du er ikke lenger innlogget. Last siden på nytt for å logge inn igjen.
                        </BodyShort>
                    </div>
                    <Button onClick={() => location.reload()}>Last siden på nytt</Button>
                </VStack>
            </Box>
        </Page.Block>
    );
};
