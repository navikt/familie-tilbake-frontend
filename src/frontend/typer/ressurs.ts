export enum RessursStatus {
    Feilet = 'FEILET',
    FunksjonellFeil = 'FUNKSJONELL_FEIL',
    Henter = 'HENTER',
    IkkeHentet = 'IKKE_HENTET',
    IkkeTilgang = 'IKKE_TILGANG',
    Suksess = 'SUKSESS',
}

export type ApiRessurs<T> = {
    data: T;
    status: RessursStatus;
    melding: string;
    frontendFeilmelding?: string;
    stacktrace: string;
};

export type Ressurs<T> =
    | {
          status: RessursStatus.IkkeHentet;
      }
    | {
          status: RessursStatus.Henter;
      }
    | {
          data: T;
          status: RessursStatus.Suksess;
      }
    | {
          frontendFeilmelding: string;
          status: RessursStatus.IkkeTilgang;
      }
    | {
          frontendFeilmelding: string;
          status: RessursStatus.Feilet;
      }
    | {
          frontendFeilmelding: string;
          status: RessursStatus.FunksjonellFeil;
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

export const byggFeiletRessurs = <T>(frontendFeilmelding: string): Ressurs<T> => {
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
