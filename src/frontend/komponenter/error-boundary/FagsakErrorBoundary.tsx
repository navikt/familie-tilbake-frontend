import type { ErrorInfo, ReactNode } from 'react';

import { BodyLong, BodyShort, Button, Heading, LocalAlert, VStack } from '@navikt/ds-react';
import { Component } from 'react';

import { FagsakIkkeStøttetError } from '~/context/FagsakContext';

type Props = {
    children: ReactNode;
};

type State = {
    hasError: boolean;
    error: Error | null;
};

export class FagsakErrorBoundary extends Component<Props, State> {
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
            return this.state.error instanceof FagsakIkkeStøttetError ? (
                <IkkeStøttetError error={this.state.error} />
            ) : (
                <FagsakError error={this.state.error} />
            );
        }

        return this.props.children;
    }
}

const IkkeStøttetError = ({ error }: { error: FagsakIkkeStøttetError }): ReactNode => {
    return (
        <div className="h-screen">
            <div className="px-45 py-20 w-full">
                <VStack gap="space-16">
                    <Heading size="large">{error.tittel}</Heading>
                    <p className="max-w-2xl text-ax-large">{error.message}</p>
                    <p className="text-ax-text-neutral-subtle pt-8 flex flex-col text-ax-small">
                        <span>Fagsystem: {error.fagsystem}</span>
                        {error.fagsakId && (
                            <>
                                <span>Fagsak: {error.fagsakId}</span>
                            </>
                        )}
                    </p>
                </VStack>
            </div>
        </div>
    );
};

const FagsakError = ({ error }: { error: Error | null }): ReactNode => {
    const isFagsakError = error?.message?.includes('fagsak');
    return (
        <div className="min-h-screen bg-surface-subtle flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
                <VStack gap="space-24">
                    <LocalAlert status="error">
                        <LocalAlert.Header>
                            <LocalAlert.Title>
                                {isFagsakError ? 'Kunne ikke laste fagsak' : 'Noe gikk galt'}
                            </LocalAlert.Title>
                        </LocalAlert.Header>
                        <LocalAlert.Content>
                            <VStack gap="space-16">
                                <BodyLong spacing>
                                    {isFagsakError ? (
                                        <>
                                            Fagsaken du prøver å åpne finnes ikke, eller du har ikke
                                            tilgang til den. Dette kan skyldes:
                                        </>
                                    ) : (
                                        <>Det oppstod en uventet feil.</>
                                    )}
                                </BodyLong>
                                {isFagsakError && (
                                    <ul className="list-disc list-inside space-y-2">
                                        <li>Feil fagsaksnummer eller fagsystem i URL-en</li>
                                        <li>Fagsaken er ikke opprettet i dette systemet ennå</li>
                                        <li>
                                            Du mangler nødvendige tilganger for å se denne fagsaken
                                        </li>
                                    </ul>
                                )}
                                {error && (
                                    <BodyShort
                                        size="small"
                                        className="text-text-subtle mt-4 font-mono bg-surface-neutral-subtle p-3 rounded"
                                    >
                                        {error?.message}
                                    </BodyShort>
                                )}
                            </VStack>
                        </LocalAlert.Content>
                    </LocalAlert>

                    <div className="flex gap-4">
                        <Button variant="primary" onClick={() => (window.location.href = '/')}>
                            Gå til forsiden
                        </Button>
                        <Button variant="secondary" onClick={() => window.location.reload()}>
                            Prøv på nytt
                        </Button>
                    </div>
                </VStack>
            </div>
        </div>
    );
};
