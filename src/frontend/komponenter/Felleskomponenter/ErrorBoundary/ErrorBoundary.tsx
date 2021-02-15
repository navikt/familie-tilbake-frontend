import * as React from 'react';

import { ISaksbehandler } from '@navikt/familie-typer';

interface IProps {
    autentisertSaksbehandler?: ISaksbehandler;
}

interface IState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);
        this.state = { hasError: false };
    }

    // eslint-disable-next-line
    static getDerivedStateFromError(_error: any) {
        return { hasError: true };
    }

    // eslint-disable-next-line
    componentDidCatch(error: any, info: any) {
        console.log(error, info);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h1>Noe har gått feil!</h1>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
