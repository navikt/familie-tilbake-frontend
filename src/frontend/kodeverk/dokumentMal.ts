export enum DokumentMal {
    INNHENT_DOKUMENTASJON = 'INNHENT_DOKUMENTASJON',
    VARSEL = 'VARSEL',
    KORRIGERT_VARSEL = 'KORRIGERT_VARSEL',
}

export const dokumentMaler: Record<DokumentMal, string> = {
    INNHENT_DOKUMENTASJON: 'Innhent dokumentasjon',
    VARSEL: 'Varsel om tilbakekreving',
    KORRIGERT_VARSEL: 'Korrigert varsel om tilbakebetaling',
};
