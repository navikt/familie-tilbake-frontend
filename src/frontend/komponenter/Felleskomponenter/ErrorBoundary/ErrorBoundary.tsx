/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars */
import type { ISaksbehandler } from '../../../typer/saksbehandler';

import { Label } from '@navikt/ds-react';
import { getCurrentScope, showReportDialog } from '@sentry/browser';
import { captureException, withScope } from '@sentry/core';
import * as React from 'react';

import { apiLoggFeil } from '../../../api/axios';

interface IProps {
    autentisertSaksbehandler?: ISaksbehandler;
    children: React.ReactNode;
}

interface IState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_error: any): IState {
        return { hasError: true };
    }

    componentDidCatch(error: any, info: any): void {
        console.log(error, info);

        if (process.env.NODE_ENV !== 'development') {
            getCurrentScope().setUser({
                username: this.props.autentisertSaksbehandler
                    ? this.props.autentisertSaksbehandler.displayName
                    : 'Ukjent bruker',
                email: this.props.autentisertSaksbehandler
                    ? this.props.autentisertSaksbehandler.email
                    : 'Ukjent email',
            });
            withScope(scope => {
                Object.keys(info).forEach(key => {
                    scope.setExtra(key, info[key]);
                    captureException(error);
                });
            });

            apiLoggFeil(`En feil har oppstått i vedtaksløsningen: \n*Error*: ${error}`);

            showReportDialog();
        }
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <Label size="small">Noe har gått feil!</Label>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
