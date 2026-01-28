import { BodyShort, Box, Button, HGrid, Link, Heading, List, Page, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { useBehandling } from '../../context/BehandlingContext';
import { useFagsak } from '../../context/FagsakContext';

type Props = {
    httpStatus?: number;
};

export const ServerFeil: React.FC<Props> = ({ httpStatus }) => {
    const { behandlingId } = useBehandling();
    const { eksternFagsakId } = useFagsak();
    return (
        <Page.Block as="main" width="xl" gutters>
            <Box paddingBlock="20 8">
                <HGrid columns="minmax(auto,600px)" data-aksel-template="500-v2">
                    <VStack gap="space-64">
                        <VStack gap="space-48" align="start">
                            <div>
                                {!!httpStatus && (
                                    <BodyShort textColor="subtle" size="small">
                                        Statuskode {httpStatus}
                                    </BodyShort>
                                )}
                                <Heading level="1" size="large" spacing>
                                    Oi, dette fungerte visst ikke
                                </Heading>
                                <BodyShort>
                                    Dette er ikke din skyld, det er en feil vi ikke håndterer.
                                </BodyShort>
                                <BodyShort spacing>
                                    Den <i>kan</i> være midlertidig, men meld gjerne fra hva som
                                    gikk galt.
                                </BodyShort>
                                <Heading level="2" size="xsmall">
                                    Hva kan du gjøre?
                                </Heading>
                                <List>
                                    <List.Item>Last siden på nytt</List.Item>
                                    <List.Item>Vent et par minutter og prøv en gang til</List.Item>
                                    <List.Item>
                                        <Link
                                            target="_blank"
                                            href="https://jira.adeo.no/plugins/servlet/desk/portal/541/create/6054"
                                        >
                                            Meld feil i porten
                                        </Link>
                                    </List.Item>
                                </List>
                            </div>
                            {(eksternFagsakId || behandlingId) && (
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
                            )}
                            <Button onClick={() => location.reload()}>Last siden på nytt</Button>
                        </VStack>
                    </VStack>
                </HGrid>
            </Box>
        </Page.Block>
    );
};
