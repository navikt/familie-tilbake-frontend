import type { ApiRessurs, Ressurs } from '../../typer/ressurs';
import type { ISaksbehandler } from '../../typer/saksbehandler';
import type { AxiosError, AxiosResponse } from 'axios';

import * as Sentry from '@sentry/core';
import axios from 'axios';

import { RessursStatus } from '../../typer/ressurs';
import { erServerFeil } from '../../utils/httpUtils';

axios.defaults.baseURL = window.location.origin;
export const preferredAxios = axios;

export interface ApiRespons<T> {
    defaultFeilmelding?: string;
    error?: AxiosError;
    innloggetSaksbehandler?: ISaksbehandler;
    loggFeilTilSentry?: boolean;
    ressurs?: ApiRessurs<T>;
    httpStatus?: number;
}

export const håndterApiRespons = <T>(apiRespons: ApiRespons<T>): Ressurs<T> => {
    const {
        defaultFeilmelding = 'En feil hos oss gjør at siden er utilgjengelig. Det skyldes ikke noe du gjorde.',
        error,
        innloggetSaksbehandler,
        loggFeilTilSentry = false,
        ressurs,
        httpStatus,
    } = apiRespons;

    let typetRessurs: Ressurs<T>;

    if (erServerFeil(httpStatus)) {
        return {
            frontendFeilmelding: ressurs?.frontendFeilmelding ?? defaultFeilmelding,
            status: RessursStatus.ServerFeil,
            httpStatusCode: httpStatus ?? 500,
        };
    }

    if (!ressurs) {
        return {
            frontendFeilmelding: defaultFeilmelding,
            status: RessursStatus.Feilet,
            httpStatusCode: httpStatus ?? 500,
        };
    }

    switch (ressurs.status) {
        case RessursStatus.Suksess:
            typetRessurs = {
                data: ressurs.data,
                status: ressurs.status,
            };
            break;
        case RessursStatus.IkkeTilgang:
            typetRessurs = {
                frontendFeilmelding: ressurs.frontendFeilmelding ?? 'Ingen tilgang',
                status: ressurs.status,
                httpStatusCode: error?.status ? error.status : 403,
            };
            break;
        case RessursStatus.Feilet:
            loggFeilTilSentry && loggFeil(error, innloggetSaksbehandler, ressurs.melding);
            typetRessurs = {
                frontendFeilmelding: ressurs.frontendFeilmelding ?? defaultFeilmelding,
                status: ressurs.status,
                httpStatusCode: error?.status ? error.status : 500,
            };
            break;
        case RessursStatus.FunksjonellFeil:
            typetRessurs = {
                frontendFeilmelding:
                    ressurs.frontendFeilmelding ?? 'En funksjonell feil har oppstått!',
                status: ressurs.status,
                httpStatusCode: error?.status ? error.status : 400,
            };
            break;
        default:
            typetRessurs = {
                frontendFeilmelding: ressurs.frontendFeilmelding ?? defaultFeilmelding,
                status: RessursStatus.Feilet,
                httpStatusCode: error?.status ? error.status : 500,
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
