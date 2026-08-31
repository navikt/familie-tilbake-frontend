import type { FC, ReactNode } from 'react';
import type { Toast, ToastTyper } from '@/komponenter/toast/typer';
import type { Ressurs } from '@/typer/ressurs';
import type { Saksbehandler } from '@/typer/saksbehandler';

import axios from 'axios';
import createUseContext from 'constate';
import { useEffect, useState } from 'react';

import { HttpProvider, useHttp } from '@/api/http/HttpProvider';
import { hentInnloggetBruker } from '@/api/saksbehandler';

type Info = {
    appImage: string;
    appName: string;
    clusterName: string;
};

type Props = {
    children: ReactNode;
};

export type Innloggingsstatus =
    | { status: 'laster' }
    | { status: 'innlogget' }
    | { status: 'feilet'; httpStatus?: number };

type AuthProviderExports = {
    innloggingsstatus: Innloggingsstatus;
    setUautorisert: (httpStatus: number) => void;
    innloggetSaksbehandler: Saksbehandler | undefined;
};

const [AuthProvider, useAuth] = createUseContext((): AuthProviderExports => {
    const [innloggetSaksbehandler, setInnloggetSaksbehandler] = useState<Saksbehandler | undefined>(
        undefined
    );
    const [innloggingsstatus, setInnloggingsstatus] = useState<Innloggingsstatus>({
        status: 'laster',
    });

    useEffect(() => {
        hentInnloggetBruker()
            .then((saksbehandler: Saksbehandler) => {
                setInnloggetSaksbehandler(saksbehandler);
                setInnloggingsstatus({ status: 'innlogget' });
            })
            .catch((feil: unknown) => {
                setInnloggingsstatus({
                    status: 'feilet',
                    httpStatus: axios.isAxiosError(feil) ? feil.response?.status : undefined,
                });
            });
    }, []);

    return {
        innloggingsstatus,
        innloggetSaksbehandler,
        setUautorisert: (httpStatus: number): void =>
            setInnloggingsstatus({ status: 'feilet', httpStatus }),
    };
});

const [AppContentProvider, useApp] = createUseContext(() => {
    const { innloggingsstatus, innloggetSaksbehandler } = useAuth();
    const { request } = useHttp();
    const [toasts, setToasts] = useState<{ [toastId: string]: Toast }>({});

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
        innloggingsstatus,
        innloggetSaksbehandler,
        hentTilbakeInfo,
        setToast: (toastId: ToastTyper, toast: Toast): void =>
            setToasts({
                ...toasts,
                [toastId]: toast,
            }),
        setToasts,
        toasts,
    };
});

const AuthOgHttpProvider: FC<Props> = ({ children }: Props) => {
    const { innloggetSaksbehandler, setUautorisert } = useAuth();

    return (
        <HttpProvider
            innloggetSaksbehandler={innloggetSaksbehandler}
            setUautorisert={setUautorisert}
        >
            <AppContentProvider>{children}</AppContentProvider>
        </HttpProvider>
    );
};

const AppProvider: FC<Props> = ({ children }: Props) => {
    return (
        <AuthProvider>
            <AuthOgHttpProvider>{children}</AuthOgHttpProvider>
        </AuthProvider>
    );
};

export { AppProvider, useApp };
