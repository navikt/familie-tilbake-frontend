export enum RessursStatus {
    FEILET = 'FEILET',
    FUNKSJONELL_FEIL = 'FUNKSJONELL_FEIL',
    HENTER = 'HENTER',
    IKKE_HENTET = 'IKKE_HENTET',
    IKKE_TILGANG = 'IKKE_TILGANG',
    SUKSESS = 'SUKSESS',
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
          status: RessursStatus.IKKE_HENTET;
      }
    | {
          status: RessursStatus.HENTER;
      }
    | {
          data: T;
          status: RessursStatus.SUKSESS;
      }
    | {
          frontendFeilmelding: string;
          status: RessursStatus.IKKE_TILGANG;
      }
    | {
          frontendFeilmelding: string;
          status: RessursStatus.FEILET;
      }
    | {
          frontendFeilmelding: string;
          status: RessursStatus.FUNKSJONELL_FEIL;
      };
