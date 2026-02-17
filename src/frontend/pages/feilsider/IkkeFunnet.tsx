import { BodyShort, Box, Heading, Page } from '@navikt/ds-react';
import * as React from 'react';

export const IkkeFunnet: React.FC = () => {
    return (
        <Page.Block as="main" width="xl" gutters>
            <Box paddingBlock="space-80 space-64" data-aksel-template="404-v2">
                <Heading size="large" spacing>
                    Beklager, vi fant ikke siden
                </Heading>
                <BodyShort>
                    Denne siden kan være slettet eller flyttet, eller det er en feil i lenken.
                </BodyShort>
            </Box>
        </Page.Block>
    );
};
