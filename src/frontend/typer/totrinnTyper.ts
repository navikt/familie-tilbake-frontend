import type { BehandlingsstegEnum } from '~/generated';

export type TotrinnsStegInfo = {
    behandlingssteg: BehandlingsstegEnum;
    godkjent?: boolean;
    begrunnelse?: string;
};

export type Totrinnkontroll = {
    totrinnsstegsinfo: TotrinnsStegInfo[];
};
