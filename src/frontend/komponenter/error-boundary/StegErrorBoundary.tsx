import type { ErrorInfo, ReactNode } from 'react';
import type { SynligSteg } from '~/utils/sider';

import { Button, Heading, Link, List, LocalAlert, VStack } from '@navikt/ds-react';
import { Component } from 'react';

type Props = {
    steg: SynligSteg;
    children: ReactNode;
};

type State = {
    hasError: boolean;
    error: Error | null;
};

const mapSynligStegTilStegNavn = (steg: SynligSteg): string => {
    switch (steg.steg) {
        case 'BREVMOTTAKER':
            return 'Brevmottaker(e)';
        case 'VERGE':
            return 'Verge';
        case 'FAKTA':
            return 'Fakta om feilutbetalingen';
        case 'FORHÅNDSVARSEL':
            return 'Forhåndsvarsel';
        case 'FORELDELSE':
            return 'Foreldelse';
        case 'VILKÅRSVURDERING':
            return 'Vilkårsvurdering';
        case 'FORESLÅ_VEDTAK':
            return 'Vedtak';
        default:
            return 'Steg';
    }
};

export class StegErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Feil ved lasting av steg:', error, errorInfo);
    }
    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <VStack gap="space-24">
                    <Heading size="medium">{mapSynligStegTilStegNavn(this.props.steg)}</Heading>

                    <LocalAlert status="error">
                        <LocalAlert.Header>
                            <LocalAlert.Title>Henting av data feilet</LocalAlert.Title>
                        </LocalAlert.Header>
                        <LocalAlert.Content className="flex flex-col gap-4">
                            <p className="flex flex-col">
                                <span>
                                    Dette er ikke din skyld, det er en feil vi ikke håndterer.
                                </span>
                                <span>
                                    Den kan være midlertidig, men meld gjerne fra hva som gikk galt.
                                </span>
                            </p>
                            <div className="flex flex-col">
                                <span className="font-bold">Hva kan du gjøre?</span>
                                <List>
                                    <List.Item>Last inn siden på nytt</List.Item>
                                    <List.Item>Vent et par minutter og prøv på nytt</List.Item>
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
                        </LocalAlert.Content>
                    </LocalAlert>
                    <div>
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                            }}
                        >
                            Prøv på nytt
                        </Button>
                    </div>
                </VStack>
            );
        }

        return this.props.children;
    }
}
