import type { Behandlingssteg } from './behandling';

type TotrinnsStegInfo = {
    behandlingssteg: Behandlingssteg;
    godkjent?: boolean;
    begrunnelse?: string;
};

export interface ITotrinnkontroll {
    totrinnsstegsinfo: TotrinnsStegInfo[];
}
