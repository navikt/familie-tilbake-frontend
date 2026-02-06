import { Alert, BodyLong, BodyShort, Button, Heading, VStack } from '@navikt/ds-react';
import React, { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

type State = {
    hasError: boolean;
    error: Error | null;
};

class FagsakErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('FagsakErrorBoundary caught error:', error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            const isFagsakError = this.state.error?.message?.includes('fagsak');

            return (
                <div className="min-h-screen bg-surface-subtle flex items-center justify-center p-8">
                    <div className="max-w-2xl w-full">
                        <VStack gap="space-24">
                            <Alert variant="error">
                                <VStack gap="space-16">
                                    <Heading size="medium" spacing>
                                        {isFagsakError
                                            ? 'Kunne ikke laste fagsak'
                                            : 'Noe gikk galt'}
                                    </Heading>
                                    <BodyLong spacing>
                                        {isFagsakError ? (
                                            <>
                                                Fagsaken du prøver å åpne finnes ikke, eller du har
                                                ikke tilgang til den. Dette kan skyldes:
                                            </>
                                        ) : (
                                            <>Det oppstod en uventet feil.</>
                                        )}
                                    </BodyLong>
                                    {isFagsakError && (
                                        <ul className="list-disc list-inside space-y-2">
                                            <li>Feil fagsaksnummer eller fagsystem i URL-en</li>
                                            <li>
                                                Fagsaken er ikke opprettet i dette systemet ennå
                                            </li>
                                            <li>
                                                Du mangler nødvendige tilganger for å se denne
                                                fagsaken
                                            </li>
                                        </ul>
                                    )}
                                    {this.state.error && (
                                        <BodyShort
                                            size="small"
                                            className="text-text-subtle mt-4 font-mono bg-surface-neutral-subtle p-3 rounded"
                                        >
                                            {this.state.error.message}
                                        </BodyShort>
                                    )}
                                </VStack>
                            </Alert>

                            <div className="flex gap-4">
                                <Button
                                    variant="primary"
                                    onClick={() => (window.location.href = '/')}
                                >
                                    Gå til forsiden
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => window.location.reload()}
                                >
                                    Prøv på nytt
                                </Button>
                            </div>
                        </VStack>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default FagsakErrorBoundary;
