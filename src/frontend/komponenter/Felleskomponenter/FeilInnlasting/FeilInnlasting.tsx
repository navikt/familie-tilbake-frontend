import type { ComponentType } from 'react';

import { Button, Heading, VStack } from '@navikt/ds-react';
import * as React from 'react';

interface Props {
    komponentNavn: string;
}
const FeilInnlasting = ({ komponentNavn }: Props) => {
    return (
        <VStack gap="2" align="center" justify="center">
            <Heading level="2" size="small" spacing className="mt-6">
                Feil ved innlasting av {komponentNavn}
            </Heading>
            <p>Det oppstod en feil under innlasting av komponenten. Vennligst prøv igjen senere.</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
                Last siden på nytt
            </Button>
        </VStack>
    );
};

export const lazyImportMedRetry = <T,>(
    importFunksjon: () => Promise<{ default: ComponentType<T> }>,
    komponentNavn: string
) => {
    return React.lazy(() => {
        let retryCount = 0;
        const maxRetries = 2;
        const attemptImport = async (): Promise<{ default: ComponentType<T> }> => {
            return importFunksjon().catch(() => {
                if (retryCount < maxRetries) {
                    retryCount++;
                    return attemptImport();
                }

                return {
                    default: () => <FeilInnlasting komponentNavn={komponentNavn} />,
                };
            });
        };

        return attemptImport();
    });
};
