import type { ErrorInfo, ReactNode } from 'react';

import { markErrorCaptured } from '@nais/apm';
import { Component } from 'react';

import { InternServerFeil } from '@/pages/feilsider/InternServerFeil';

import { rapporterRenderFeil } from './rapporterRenderFeil';

type Props = {
    children: ReactNode;
};

type State = {
    hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        markErrorCaptured(error);
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        rapporterRenderFeil(error, errorInfo);
    }

    render(): ReactNode {
        return this.state.hasError ? <InternServerFeil /> : this.props.children;
    }
}
