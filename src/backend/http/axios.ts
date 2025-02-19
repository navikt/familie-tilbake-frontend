import * as Sentry from '@sentry/core';
import axios, { AxiosError, AxiosResponse } from 'axios';

import { ISaksbehandler } from '../../frontend/typer/saksbehandler';
import { ApiRessurs, Ressurs, RessursStatus } from '../../frontend/typer/ressurs';

axios.defaults.baseURL = window.location.origin;
export const preferredAxios = axios;

export interface ApiRespons<T> {
    defaultFeilmelding?: string;
    error?: AxiosError;
    innloggetSaksbehandler?: ISaksbehandler;
    loggFeilTilSentry?: boolean;
    ressurs?: ApiRessurs<T>;
}

export const håndterApiRespons = <T>(apiRespons: ApiRespons<T>): Ressurs<T> => {
    const {
        defaultFeilmelding = 'En feil har oppstått!',
        error,
        innloggetSaksbehandler,
        loggFeilTilSentry = false,
        ressurs,
    } = apiRespons;

    let typetRessurs: Ressurs<T>;

    if (!ressurs) {
        return {
            frontendFeilmelding: defaultFeilmelding,
            status: RessursStatus.FEILET,
        };
    }

    switch (ressurs.status) {
        case RessursStatus.SUKSESS:
            typetRessurs = {
                data: ressurs.data,
                status: RessursStatus.SUKSESS,
            };
            break;
        case RessursStatus.IKKE_TILGANG:
            typetRessurs = {
                frontendFeilmelding: ressurs.frontendFeilmelding ?? 'Ikke tilgang',
                status: RessursStatus.IKKE_TILGANG,
            };
            break;
        case RessursStatus.FEILET:
            loggFeilTilSentry && loggFeil(error, innloggetSaksbehandler, ressurs.melding);
            typetRessurs = {
                frontendFeilmelding: ressurs.frontendFeilmelding ?? defaultFeilmelding,
                status: RessursStatus.FEILET,
            };
            break;
        case RessursStatus.FUNKSJONELL_FEIL:
            typetRessurs = {
                frontendFeilmelding:
                    ressurs.frontendFeilmelding ?? 'En funksjonell feil har oppstått!',
                status: RessursStatus.FUNKSJONELL_FEIL,
            };
            break;
        default:
            typetRessurs = {
                frontendFeilmelding: defaultFeilmelding,
                status: RessursStatus.FEILET,
            };
            break;
    }

    return typetRessurs;
};

export const loggFeil = (
    error?: AxiosError,
    innloggetSaksbehandler?: ISaksbehandler,
    feilmelding?: string
): void => {
    if (process.env.NODE_ENV !== 'development') {
        Sentry.getCurrentScope().setUser({
            username: innloggetSaksbehandler ? innloggetSaksbehandler.displayName : 'Ukjent bruker',
        });

        const response: AxiosResponse | undefined = error ? error.response : undefined;
        if (response) {
            Sentry.withScope(scope => {
                scope.setExtra('nav-call-id', response.headers['nav-call-id']);
                scope.setExtra('status text', response.statusText);
                scope.setExtra('status', response.status);
                scope.setExtra('feilmelding', feilmelding);

                Sentry.captureException(error);
            });
        }
    }
};
