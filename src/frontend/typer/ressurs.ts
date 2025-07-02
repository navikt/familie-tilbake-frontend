import { erServerFeil } from '../utils/httpUtils';

export enum RessursStatus {
    Feilet = 'FEILET',
    FunksjonellFeil = 'FUNKSJONELL_FEIL',
    Henter = 'HENTER',
    IkkeHentet = 'IKKE_HENTET',
    IkkeTilgang = 'IKKE_TILGANG',
    Suksess = 'SUKSESS',
    ServerFeil = 'SERVERFEIL',
}

export type ApiRessurs<T> = {
    data: T;
    melding: string;
    stacktrace: string;
    status: RessursStatus;
    frontendFeilmelding?: string;
    httpStatusCode?: number;
};

export type Ressurs<T> =
    | {
          data: T;
          status: RessursStatus.Suksess;
      }
    | {
          frontendFeilmelding: string;
          status: RessursStatus.Feilet;
          httpStatusCode?: number;
      }
    | {
          frontendFeilmelding: string;
          status: RessursStatus.FunksjonellFeil;
          httpStatusCode?: number;
      }
    | {
          frontendFeilmelding: string;
          status: RessursStatus.IkkeTilgang;
          httpStatusCode?: number;
      }
    | {
          frontendFeilmelding: string;
          status: RessursStatus.ServerFeil;
          httpStatusCode?: number;
      }
    | {
          status: RessursStatus.Henter;
      }
    | {
          status: RessursStatus.IkkeHentet;
      };

export const byggTomRessurs = <T>(): Ressurs<T> => {
    return {
        status: RessursStatus.IkkeHentet,
    };
};

export const byggDataRessurs = <T>(data: T): Ressurs<T> => {
    return {
        status: RessursStatus.Suksess,
        data,
    };
};

export const byggHenterRessurs = <T>(): Ressurs<T> => {
    return {
        status: RessursStatus.Henter,
    };
};

export const byggFeiletRessurs = <T>(
    frontendFeilmelding: string,
    httpStatus?: number
): Ressurs<T> => {
    if (erServerFeil(httpStatus)) {
        return {
            frontendFeilmelding,
            status: RessursStatus.ServerFeil,
        };
    }
    return {
        frontendFeilmelding,
        status: RessursStatus.Feilet,
    };
};

export const byggFunksjonellFeilRessurs = <T>(frontendFeilmelding: string): Ressurs<T> => {
    return {
        frontendFeilmelding,
        status: RessursStatus.FunksjonellFeil,
    };
};

export const byggSuksessRessurs = <T>(data: T): Ressurs<T> => {
    return {
        data,
        status: RessursStatus.Suksess,
    };
};

export const hentDataFraRessurs = <T>(ressurs: Ressurs<T>): T | undefined => {
    return ressurs.status === RessursStatus.Suksess ? ressurs.data : undefined;
};

export const hentDataFraRessursMedFallback = <T>(ressurs: Ressurs<T>, fallbackData: T): T => {
    return ressurs.status === RessursStatus.Suksess ? ressurs.data : fallbackData;
};
