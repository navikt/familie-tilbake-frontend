import type { Toast, ToastTyper } from '../komponenter/toast/typer';
import type { Ressurs } from '../typer/ressurs';
import type { Saksbehandler } from '../typer/saksbehandler';

import createUseContext from 'constate';
import * as React from 'react';
import { useState } from 'react';

import { HttpProvider, useHttp } from '../api/http/HttpProvider';

type Info = {
    appImage: string;
    appName: string;
    clusterName: string;
};

type Props = {
    children: React.ReactNode;
};

type AppProps = {
    autentisertSaksbehandler: Saksbehandler | undefined;
};

type AuthProviderExports = {
    autentisert: boolean;
    settAutentisert: (autentisert: boolean) => void;
    innloggetSaksbehandler: Saksbehandler | undefined;
};

const [AuthProvider, useAuth] = createUseContext(
    ({ autentisertSaksbehandler }: AppProps): AuthProviderExports => {
        const [autentisert, settAutentisert] = React.useState(true);
        const [innloggetSaksbehandler, settInnloggetSaksbehandler] =
            React.useState(autentisertSaksbehandler);

        React.useEffect(() => {
            if (autentisertSaksbehandler) {
                settAutentisert(true);
                settInnloggetSaksbehandler(autentisertSaksbehandler);
            }
        }, [autentisertSaksbehandler]);

        return {
            autentisert,
            innloggetSaksbehandler,
            settAutentisert,
        };
    }
);

const [AppContentProvider, useApp] = createUseContext(() => {
    const { autentisert, innloggetSaksbehandler } = useAuth();
    const { request } = useHttp();
    const [toasts, settToasts] = useState<{ [toastId: string]: Toast }>({});

    const hentTilbakeInfo = (): void => {
        request<void, Info>({
            url: '/familie-tilbake/api/info',
            method: 'GET',
        }).then((info: Ressurs<Info>) => {
            if (info.status === 'SUKSESS') {
                console.log('info response: ', info.data);
            } else {
                console.log('error!', info);
            }
        });
    };

    return {
        autentisert,
        innloggetSaksbehandler,
        hentTilbakeInfo,
        settToast: (toastId: ToastTyper, toast: Toast): void =>
            settToasts({
                ...toasts,
                [toastId]: toast,
            }),
        settToasts,
        toasts,
    };
});

const AuthOgHttpProvider: React.FC<Props> = ({ children }) => {
    const { innloggetSaksbehandler, settAutentisert } = useAuth();

    return (
        <HttpProvider
            innloggetSaksbehandler={innloggetSaksbehandler}
            settAutentisert={settAutentisert}
        >
            <AppContentProvider>{children}</AppContentProvider>
        </HttpProvider>
    );
};

const AppProvider: React.FC<AppProps & Props> = ({ autentisertSaksbehandler, children }) => {
    return (
        <AuthProvider autentisertSaksbehandler={autentisertSaksbehandler}>
            <AuthOgHttpProvider>{children}</AuthOgHttpProvider>
        </AuthProvider>
    );
};

export { AppProvider, useApp };
