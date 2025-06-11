import { BodyShort, Box, Button, HGrid, Heading, List, Page, VStack } from '@navikt/ds-react';
import * as React from 'react';

interface Props {
    statusKode?: number;
    eksternFagsakId?: string;
    behandlingId?: string;
}

export const ServerFeil: React.FC<Props> = ({ statusKode, eksternFagsakId, behandlingId }) => {
    return (
        <Page.Block as="main" width="xl" gutters>
            <Box paddingBlock="20 8">
                <HGrid columns="minmax(auto,600px)" data-aksel-template="500-v2">
                    <VStack gap="16">
                        <VStack gap="12" align="start">
                            <div>
                                {!!statusKode && (
                                    <BodyShort textColor="subtle" size="small">
                                        Statuskode {statusKode}
                                    </BodyShort>
                                )}
                                <Heading level="1" size="large" spacing>
                                    Oi, dette fungerte visst ikke
                                </Heading>
                                <BodyShort spacing>
                                    Dette er ikke din skyld, det er en feil vi ikke håndterer.
                                </BodyShort>
                                <BodyShort>
                                    Den <i>kan</i> være midlertidig, men meld gjerne fra hva som
                                    gikk galt.
                                </BodyShort>
                            </div>
                            <div>
                                <Heading level="2" size="xsmall" spacing>
                                    Hva kan du gjøre?
                                </Heading>
                                <List>
                                    <List.Item>Last siden på nytt</List.Item>
                                    <List.Item>Vent et par minutter og prøv en gang til</List.Item>
                                </List>
                            </div>
                            <div>
                                {!!eksternFagsakId && (
                                    <BodyShort size="small" textColor="subtle">
                                        Fagsak ID: {eksternFagsakId}
                                    </BodyShort>
                                )}
                                {!!behandlingId && (
                                    <BodyShort size="small" textColor="subtle">
                                        Behandlings ID: {behandlingId}
                                    </BodyShort>
                                )}
                            </div>
                            <Button onClick={() => location.reload()}>Last siden på nytt</Button>
                        </VStack>
                    </VStack>
                </HGrid>
            </Box>
        </Page.Block>
    );
};
