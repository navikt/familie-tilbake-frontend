import * as React from 'react';

import createUseContext from 'constate';

import { HttpProvider, useHttp } from '@navikt/familie-http';
import type { ISaksbehandler, Ressurs } from '@navikt/familie-typer';

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
            <AuthOgHttpProvider children={children} />
        </AuthProvider>
    );
};

export { AppProvider, useApp };
