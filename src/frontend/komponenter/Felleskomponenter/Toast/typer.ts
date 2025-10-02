export type Toast = {
    alertType: AlertType;
    tekst: string;
};

export enum ToastTyper {
    BrevmottakerIkkeTillat = 'BREVMOTTAKER_IKKE_TILLATT',
    BrevmottakerLagret = 'BREVMOTTAKER_LAGRET',
    BrevmottakerFjernet = 'BREVMOTTAKER_FJERNET',
    KravgrunnlaHentet = 'KRAVGRUNNLAG_HENTET',
    FlyttBehandlingTilFakta = 'FLYTT_BEHANDLING_TIL_FAKTA',
}

export enum AlertType {
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
    Success = 'success',
}
