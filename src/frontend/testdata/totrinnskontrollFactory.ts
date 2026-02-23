import type { TotrinnsStegInfo } from '~/typer/totrinnTyper';

export const lagTotrinnsStegInfo = (
    behandlingssteg: TotrinnsStegInfo['behandlingssteg'],
    godkjent?: TotrinnsStegInfo['godkjent'],
    begrunnelse?: TotrinnsStegInfo['begrunnelse']
): TotrinnsStegInfo => ({
    behandlingssteg: behandlingssteg,
    godkjent: godkjent,
    begrunnelse: begrunnelse,
});
