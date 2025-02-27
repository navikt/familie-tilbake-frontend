import type { IToast, ToastTyper } from '../komponenter/Felleskomponenter/Toast/typer';
import type { Ressurs } from '../typer/ressurs';
import type { ISaksbehandler } from '../typer/saksbehandler';

import createUseContext from 'constate';
import * as React from 'react';
import { useState } from 'react';

import { HttpProvider, useHttp } from '../api/http/HttpProvider';

interface IInfo {
    appImage: string;
    appName: string;
    namespace: string;
    clusterName: string;
}

interface IProps {
    children: React.ReactNode;
}

interface AppProps {
    autentisertSaksbehandler: ISaksbehandler | undefined;
}

interface AuthProviderExports {
    autentisert: boolean;
    settAutentisert: (autentisert: boolean) => void;
    innloggetSaksbehandler: ISaksbehandler | undefined;
}

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
    const [toasts, settToasts] = useState<{ [toastId: string]: IToast }>({});

    const hentTilbakeInfo = (): void => {
        request<void, IInfo>({
            url: '/familie-tilbake/api/info',
            method: 'GET',
        }).then((info: Ressurs<IInfo>) => {
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
        settToast: (toastId: ToastTyper, toast: IToast) =>
            settToasts({
                ...toasts,
                [toastId]: toast,
            }),
        settToasts,
        toasts,
    };
});

const AuthOgHttpProvider: React.FC<IProps> = ({ children }) => {
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

const AppProvider: React.FC<AppProps & IProps> = ({ autentisertSaksbehandler, children }) => {
    return (
        <AuthProvider autentisertSaksbehandler={autentisertSaksbehandler}>
            <AuthOgHttpProvider>{children}</AuthOgHttpProvider>
        </AuthProvider>
    );
};

export { AppProvider, useApp };
