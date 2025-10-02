import type { Behandlingssteg } from './behandling';

type TotrinnsStegInfo = {
    behandlingssteg: Behandlingssteg;
    godkjent?: boolean;
    begrunnelse?: string;
};

export type Totrinnkontroll = {
    totrinnsstegsinfo: TotrinnsStegInfo[];
};
