import type { TotrinnsStegInfo } from '../typer/totrinnTyper';

import { Behandlingssteg } from '../typer/behandling';

export const lagTotrinnskontrollFaktainfo = (
    godkjent?: TotrinnsStegInfo['godkjent'],
    begrunnelse?: TotrinnsStegInfo['begrunnelse']
): TotrinnsStegInfo => ({
    behandlingssteg: Behandlingssteg.Fakta,
    godkjent: godkjent,
    begrunnelse: begrunnelse,
});

export const lagTotrinnskontrollForeldelsesinfo = (
    godkjent?: TotrinnsStegInfo['godkjent'],
    begrunnelse?: TotrinnsStegInfo['begrunnelse']
): TotrinnsStegInfo => ({
    behandlingssteg: Behandlingssteg.Foreldelse,
    godkjent: godkjent,
    begrunnelse: begrunnelse,
});

export const lagTotrinnskontrollVilkårsvurderingsinfo = (
    godkjent?: TotrinnsStegInfo['godkjent'],
    begrunnelse?: TotrinnsStegInfo['begrunnelse']
): TotrinnsStegInfo => ({
    behandlingssteg: Behandlingssteg.Vilkårsvurdering,
    godkjent: godkjent,
    begrunnelse: begrunnelse,
});

export const lagTotrinnskontrollForeslåVedtaksinfo = (
    godkjent?: TotrinnsStegInfo['godkjent'],
    begrunnelse?: TotrinnsStegInfo['begrunnelse']
): TotrinnsStegInfo => ({
    behandlingssteg: Behandlingssteg.ForeslåVedtak,
    godkjent: godkjent,
    begrunnelse: begrunnelse,
});
