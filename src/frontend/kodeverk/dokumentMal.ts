export enum DokumentMal {
    InnhentDokumentasjon = 'INNHENT_DOKUMENTASJON',
    Varsel = 'VARSEL',
    KorrigertVarsel = 'KORRIGERT_VARSEL',
}

export const dokumentMaler: Record<DokumentMal, string> = {
    [DokumentMal.InnhentDokumentasjon]: 'Innhent dokumentasjon',
    [DokumentMal.Varsel]: 'Varsel om tilbakekreving',
    [DokumentMal.KorrigertVarsel]: 'Korrigert varsel om tilbakebetaling',
};
