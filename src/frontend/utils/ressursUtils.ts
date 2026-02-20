import { type Ressurs, RessursStatus } from '@typer/ressurs';

export const hentFrontendFeilmelding = <T>(ressurs: Ressurs<T>): string | undefined =>
    ressurs.status === RessursStatus.Feilet ||
    ressurs.status === RessursStatus.FunksjonellFeil ||
    ressurs.status === RessursStatus.IkkeTilgang ||
    ressurs.status === RessursStatus.ServerFeil
        ? ressurs.frontendFeilmelding
        : undefined;
