import { type Ressurs, RessursStatus } from '@/typer/ressurs';

export const hentFrontendFeilmelding = <T>(ressurs: Ressurs<T>): string | undefined =>
    ressurs.status === RessursStatus.Feilet ||
    ressurs.status === RessursStatus.FunksjonellFeil ||
    ressurs.status === RessursStatus.IkkeTilgang ||
    ressurs.status === RessursStatus.ServerFeil
        ? ressurs.frontendFeilmelding
        : undefined;

export const hentGlobalAlertFeilmelding = <T>(
    ressurs: Ressurs<T>,
    standardTittel: string
): { title: string; message: string } | undefined => {
    if (
        ressurs.status !== RessursStatus.Feilet &&
        ressurs.status !== RessursStatus.FunksjonellFeil &&
        ressurs.status !== RessursStatus.IkkeTilgang &&
        ressurs.status !== RessursStatus.ServerFeil
    ) {
        return undefined;
    }

    return {
        title: ressurs.apiFeilmelding?.tittel ?? standardTittel,
        message: ressurs.apiFeilmelding?.melding ?? ressurs.frontendFeilmelding,
    };
};
