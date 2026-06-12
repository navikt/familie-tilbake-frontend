import type { StegEnum } from '@/generated';

export type TotrinnsStegInfo = {
    behandlingssteg: StegEnum;
    godkjent?: boolean;
    begrunnelse?: string;
};

export type Totrinnkontroll = {
    totrinnsstegsinfo: TotrinnsStegInfo[];
};
