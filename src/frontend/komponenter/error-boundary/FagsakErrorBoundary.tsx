import type { ErrorInfo, ReactNode } from 'react';

import { Component } from 'react';

import { Forbudt } from '@/pages/feilsider/Forbudt';
import { IkkeFunnet } from '@/pages/feilsider/IkkeFunnet';
import { InternServerFeil } from '@/pages/feilsider/InternServerFeil';
import { Uautorisert } from '@/pages/feilsider/Uautorisert';
import { hentFeilmelding, hentHttpStatus } from '@/utils/httpUtils';

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
            switch (hentHttpStatus(this.state.error)) {
                case 401:
                    return <Uautorisert />;
                case 403:
                    return <Forbudt feilmelding={hentFeilmelding(this.state.error)} />;
                case 404:
                    return <IkkeFunnet />;
                default:
                    return <InternServerFeil />;
            }
        }

        return this.props.children;
    }
}
