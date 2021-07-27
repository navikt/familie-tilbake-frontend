import { Behandlingssteg } from '../../../../../typer/behandling';

export interface TotrinnGodkjenningOption {
    verdi: boolean;
    label: string;
}

export const OptionGodkjent = {
    verdi: true,
    label: 'Godkjent',
};

export const OptionIkkeGodkjent = {
    verdi: false,
    label: 'Vurder på nytt',
};

export const totrinnGodkjenningOptions = [OptionGodkjent, OptionIkkeGodkjent];

export interface TotrinnStegSkjemaData {
    index: string;
    behandlingssteg: Behandlingssteg;
    godkjent?: TotrinnGodkjenningOption;
    begrunnelse?: string;
    harFeilIBegrunnelse?: boolean;
    begrunnelseFeilmelding?: string;
    feilmelding?: string;
}
