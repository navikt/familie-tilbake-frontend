import * as React from 'react';

import { Element } from 'nav-frontend-typografi';

import { ISaksbehandler } from '@navikt/familie-typer';

import { apiLoggFeil } from '../../../api/axios';

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

        if (process.env.NODE_ENV !== 'development') {
            apiLoggFeil(`En feil har oppstått i vedtaksløsningen: \n*Error*: ${error}`);
        }
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <Element>Noe har gått feil!</Element>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
