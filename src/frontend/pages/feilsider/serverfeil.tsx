import type { FC } from 'react';

import { BodyShort, Box, Button, HGrid, Heading, Link, List, Page, VStack } from '@navikt/ds-react';

type Props = {
    httpStatus?: number;
    fagsakId?: string;
    behandlingId?: string;
};

export const Serverfeil: FC<Props> = ({ httpStatus, fagsakId, behandlingId }) => {
    return (
        <Page.Block width="xl" gutters>
            <Box paddingBlock="space-80 space-32">
                <HGrid columns="minmax(auto,600px)" data-aksel-template="500-v2">
                    <VStack gap="space-64">
                        <VStack gap="space-48" align="start">
                            <div>
                                {!!httpStatus && (
                                    <BodyShort textColor="subtle" size="small">
                                        Statuskode {httpStatus}
                                    </BodyShort>
                                )}
                                <Heading size="large" spacing>
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
                                <Box marginBlock="space-16" asChild>
                                    <List data-aksel-migrated-v8>
                                        <List.Item>Last siden på nytt</List.Item>
                                        <List.Item>
                                            Vent et par minutter og prøv en gang til
                                        </List.Item>
                                        <List.Item>
                                            <Link
                                                target="_blank"
                                                href="https://jira.adeo.no/plugins/servlet/desk/portal/541/create/6054"
                                            >
                                                Meld feil i porten
                                            </Link>
                                        </List.Item>
                                    </List>
                                </Box>
                            </div>

                            {(fagsakId || behandlingId) && (
                                <div>
                                    {fagsakId && (
                                        <BodyShort size="small" textColor="subtle">
                                            Fagsak ID: {fagsakId}
                                        </BodyShort>
                                    )}
                                    {behandlingId && (
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
