import type { Behandlingssteg } from './behandling';

export type TotrinnsStegInfo = {
    behandlingssteg: Behandlingssteg;
    godkjent?: boolean;
    begrunnelse?: string;
};

export type Totrinnkontroll = {
    totrinnsstegsinfo: TotrinnsStegInfo[];
};
