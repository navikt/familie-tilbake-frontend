import type { AxiosError, AxiosStatic } from 'axios';
import type { Error as ApiError } from '@/generated-new';
import type { ApiRessurs, Ressurs } from '@/typer/ressurs';

import axios from 'axios';

import { RessursStatus } from '@/typer/ressurs';
import { erServerFeil } from '@/utils/httpUtils';

axios.defaults.baseURL = window.location.origin;
export const preferredAxios: AxiosStatic = axios;

type ApiRespons<T> = {
    defaultFeilmelding?: string;
    error?: AxiosError;
    ressurs?: ApiRessurs<T>;
    httpStatus?: number;
};

const hentApiFeilmelding = <T>(ressurs: ApiRessurs<T>): ApiError | undefined =>
    typeof ressurs.tittel === 'string'
        ? {
              tittel: ressurs.tittel,
              melding: ressurs.melding,
          }
        : undefined;

export const håndterApiRespons = <T>(apiRespons: ApiRespons<T>): Ressurs<T> => {
    const {
        defaultFeilmelding = 'En feil hos oss gjør at siden er utilgjengelig. Det skyldes ikke noe du gjorde.',
        error,
        ressurs,
        httpStatus,
    } = apiRespons;

    let typetRessurs: Ressurs<T>;

    if (erServerFeil(httpStatus)) {
        return {
            frontendFeilmelding:
                ressurs?.frontendFeilmelding ?? ressurs?.melding ?? defaultFeilmelding,
            apiFeilmelding: ressurs ? hentApiFeilmelding(ressurs) : undefined,
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
                frontendFeilmelding:
                    ressurs.frontendFeilmelding ?? ressurs.melding ?? 'Ingen tilgang',
                apiFeilmelding: hentApiFeilmelding(ressurs),
                status: ressurs.status,
                httpStatusCode: error?.status ? error.status : 403,
            };
            break;
        case RessursStatus.Feilet:
            typetRessurs = {
                frontendFeilmelding:
                    ressurs.frontendFeilmelding ?? ressurs.melding ?? defaultFeilmelding,
                apiFeilmelding: hentApiFeilmelding(ressurs),
                status: ressurs.status,
                httpStatusCode: error?.status ? error.status : 500,
            };
            break;
        case RessursStatus.FunksjonellFeil:
            typetRessurs = {
                frontendFeilmelding:
                    ressurs.frontendFeilmelding ??
                    ressurs.melding ??
                    'En funksjonell feil har oppstått!',
                apiFeilmelding: hentApiFeilmelding(ressurs),
                status: ressurs.status,
                httpStatusCode: error?.status ? error.status : 400,
            };
            break;
        default:
            typetRessurs = {
                frontendFeilmelding:
                    ressurs.frontendFeilmelding ?? ressurs.melding ?? defaultFeilmelding,
                apiFeilmelding: hentApiFeilmelding(ressurs),
                status: RessursStatus.Feilet,
                httpStatusCode: error?.status ? error.status : 500,
            };
            break;
    }

    return typetRessurs;
};
