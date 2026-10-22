import type { ReactNode } from 'react';

import { Component } from 'react';

import { apiLoggFeil } from '@/api/axios';
import { InternServerFeil } from '@/pages/feilsider/InternServerFeil';

type Props = {
    children: ReactNode;
};

type State = {
    hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    // biome-ignore lint/suspicious/noExplicitAny: React componentDidCatch gir utypet error/info
    componentDidCatch(error: any, info: any): void {
        console.log(error, info);

        if (process.env.NODE_ENV !== 'development') {
            apiLoggFeil(`En feil har oppstått i vedtaksløsningen: \n*Error*: ${error}`);
        }
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return <InternServerFeil />;
        }

        return this.props.children;
    }
}
