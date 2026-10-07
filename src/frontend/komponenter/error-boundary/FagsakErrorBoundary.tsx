import type { ErrorInfo, ReactNode } from 'react';
import type { SchemaEnum2 as Fagsystem } from '@/generated';

import { Component } from 'react';

import { Forbudt } from '@/pages/feilsider/Forbudt';
import { IkkeFunnet } from '@/pages/feilsider/IkkeFunnet';
import { InternServerFeil } from '@/pages/feilsider/InternServerFeil';
import { KravgrunnlagErSperretEllerBortfalt } from '@/pages/feilsider/KravgrunnlagetErSperretEllerBortfalt';
import { Uautorisert } from '@/pages/feilsider/Uautorisert';
import { hentFeilmelding, hentFeilmeldingTittelOgMelding, hentHttpStatus } from '@/utils/httpUtils';

type Props = {
    children: ReactNode;
    fagsystem: Fagsystem;
    fagsakId: string;
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
            switch (hentHttpStatus(this.state.error)) {
                case 401:
                    return <Uautorisert />;
                case 403:
                    return <Forbudt feilmelding={hentFeilmelding(this.state.error)} />;
                case 404:
                    return <IkkeFunnet />;
                case 405: {
                    const { tittel, melding } = hentFeilmeldingTittelOgMelding(this.state.error);
                    return (
                        <KravgrunnlagErSperretEllerBortfalt
                            fagsystem={this.props.fagsystem}
                            fagsakId={this.props.fagsakId}
                            tittel={tittel}
                            melding={melding}
                        />
                    );
                }
                default:
                    return <InternServerFeil />;
            }
        }

        return this.props.children;
    }
}
