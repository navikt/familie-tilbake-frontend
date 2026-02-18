import type { ForeldelsePeriodeSkjemeData } from '@pages/fagsak/foreldelse/typer/foreldelse';
import type { ForeldelsePeriode, ForeldelseResponse } from '@typer/tilbakekrevingstyper';

export const lagForeldelsePeriode = (
    overrides?: Partial<ForeldelsePeriode>
): ForeldelsePeriode => ({
    periode: { fom: '2021-01-01', tom: '2021-04-30' },
    feilutbetaltBeløp: 0,
    foreldelsesfrist: undefined,
    oppdagelsesdato: undefined,
    begrunnelse: undefined,
    foreldelsesvurderingstype: undefined,
    ...overrides,
});

export const lagForeldelseResponse = (
    overrides?: Partial<ForeldelseResponse>
): ForeldelseResponse => ({
    foreldetPerioder: [lagForeldelsePeriode()],
    ...overrides,
});

export const lagForeldelsePeriodeSkjemaData = (
    overrides?: Partial<ForeldelsePeriodeSkjemeData>
): ForeldelsePeriodeSkjemeData => ({
    index: 'i1',
    ...lagForeldelsePeriode(overrides),
});
