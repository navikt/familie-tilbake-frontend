export interface IToast {
    alertType: AlertType;
    tekst: string;
}

export enum ToastTyper {
    BREVMOTTAKER_IKKE_TILLAT = 'BREVMOTTAKER_IKKE_TILLATT',
    BREVMOTTAKER_LAGRET = 'BREVMOTTAKER_LAGRET',
    BREVMOTTAKER_FJERNET = 'BREVMOTTAKER_FJERNET',
}

export enum AlertType {
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
    SUCCESS = 'success',
}
