import type { ComponentType, FC, LazyExoticComponent } from 'react';

import { Button, Heading, VStack } from '@navikt/ds-react';
import { lazy } from 'react';

type Props = {
    komponentNavn: string;
};

const FeilInnlasting: FC<Props> = ({ komponentNavn }: Props) => {
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
    importFunksjon: () => Promise<Record<string, ComponentType<T>>>,
    komponentNavn: string
): LazyExoticComponent<ComponentType<T>> => {
    return lazy(() => {
        let forsøkAntall = 0;
        const maxForsøk = 2;
        const forsøkImport = async (): Promise<{ default: ComponentType<T> }> => {
            try {
                const modul = await importFunksjon();
                const komponent = modul[komponentNavn];
                if (!komponent) {
                    throw new Error(
                        `Fant ikke eksport "${komponentNavn}" i modulen. Tilgjengelige eksporter: ${Object.keys(modul).join(', ')}`
                    );
                }
                return { default: komponent };
            } catch (e) {
                console.error(e);
                if (forsøkAntall < maxForsøk) {
                    forsøkAntall++;
                    return forsøkImport();
                }

                return {
                    default: () => <FeilInnlasting komponentNavn={komponentNavn} />,
                };
            }
        };

        return forsøkImport();
    });
};
