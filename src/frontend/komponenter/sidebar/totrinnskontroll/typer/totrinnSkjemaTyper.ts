import type { BehandlingsstegEnum } from '@generated';

export type TotrinnGodkjenningOption = {
    verdi: boolean;
    label: string;
};

export const OptionGodkjent = {
    verdi: true,
    label: 'Godkjent',
};

export const OptionIkkeGodkjent = {
    verdi: false,
    label: 'Vurder på nytt',
};

export const totrinnGodkjenningOptions = [OptionGodkjent, OptionIkkeGodkjent];

export type TotrinnStegSkjemaData = {
    index: string;
    behandlingssteg: BehandlingsstegEnum;
    godkjent: TotrinnGodkjenningOption | '';
    begrunnelse?: string;
    harFeilIBegrunnelse?: boolean;
    begrunnelseFeilmelding?: string;
    feilmelding?: string;
};
