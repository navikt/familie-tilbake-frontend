import {
    HarBrukerUttaltSegValg,
    Tilbakekrevingsvalg,
    type FaktaPeriode,
    type FaktaResponse,
} from '~/typer/tilbakekrevingstyper';

export const lagFaktaPeriode = (overrides?: Partial<FaktaPeriode>): FaktaPeriode => ({
    periode: { fom: '2021-01-01', tom: '2021-04-30' },
    feilutbetaltBeløp: 0,
    hendelsestype: undefined,
    hendelsesundertype: undefined,
    ...overrides,
});

export const lagFaktaResponse = (overrides?: Partial<FaktaResponse>): FaktaResponse => ({
    feilutbetaltePerioder: [lagFaktaPeriode()],
    revurderingsvedtaksdato: '2021-02-05',
    totalFeilutbetaltPeriode: {
        fom: '2020-01-01',
        tom: '2020-10-31',
    },
    totaltFeilutbetaltBeløp: 3999,
    varsletBeløp: 5200,
    faktainfo: {
        revurderingsårsak: 'Nye opplysninger',
        revurderingsresultat: 'Opphør av ytelsen',
        tilbakekrevingsvalg: Tilbakekrevingsvalg.OpprettTilbakekrevingMedVarsel,
        konsekvensForYtelser: ['Reduksjon av ytelsen', 'Feilutbetaling'],
    },
    begrunnelse: undefined,
    vurderingAvBrukersUttalelse: {
        harBrukerUttaltSeg: HarBrukerUttaltSegValg.IkkeVurdert,
    },
    opprettetTid: '2020-01-01',
    ...overrides,
});
