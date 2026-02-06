import type { ComponentType } from 'react';

import { Button, Heading, VStack } from '@navikt/ds-react';
import * as React from 'react';
import { lazy } from 'react';

type Props = {
    komponentNavn: string;
};

const FeilInnlasting: React.FC<Props> = ({ komponentNavn }: Props) => {
    return (
        <VStack gap="space-8" align="center" justify="center">
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
): React.LazyExoticComponent<ComponentType<T>> => {
    return lazy(() => {
        let forsøkAntall = 0;
        const maxForsøk = 2;
        const forsøkImport = async (): Promise<{ default: ComponentType<T> }> => {
            return importFunksjon().catch(e => {
                console.error(e);
                if (forsøkAntall < maxForsøk) {
                    forsøkAntall++;
                    return forsøkImport();
                }

                return {
                    default: () => <FeilInnlasting komponentNavn={komponentNavn} />,
                };
            });
        };

        return forsøkImport();
    });
};
