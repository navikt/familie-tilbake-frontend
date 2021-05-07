import { Behandlingssteg } from './behandling';

export type TotrinnsStegInfo = {
    behandlingssteg: Behandlingssteg;
    godkjent?: boolean;
    begrunnelse?: string;
};

export interface ITotrinnkontroll {
    totrinnsstegsinfo: TotrinnsStegInfo[];
}
