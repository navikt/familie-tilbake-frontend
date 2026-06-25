import type { VilkaarsvurderingValg } from '@/generated-new';
import type { Vilkårsperiode } from './typer';

import { erPeriodeVurdert, finnStandardValgtPeriode, utledVurdering } from './utils';

const godTro: VilkaarsvurderingValg = {
    vurdering: 'god_tro',
    begrunnelse: 'Mottaker var i god tro',
    beløpIBehold: {
        belopIBehold: 'ingenting',
        begrunnelse: 'Hele beløpet er forbrukt',
    },
};
const forstoEllerBurdeForstått: VilkaarsvurderingValg = {
    vurdering: 'forsto_eller_burde_forstått',
};
const uaktsomt: VilkaarsvurderingValg = {
    vurdering: 'forårsaket_av_mottaker',
    begrunnelse: 'Feilutbetalingen er forårsaket av mottaker',
    aktsomhet: {
        aktsomhet: 'uaktsomt',
        begrunnelse: 'Mottaker handlet uaktsomt',
        unnlatelse: {
            unnlatelse: 'skalUnnlates',
            begrunnelse: 'Tilbakekreving skal unnlates',
        },
    },
};
const grovtUaktsomt: VilkaarsvurderingValg = {
    vurdering: 'forårsaket_av_mottaker',
    begrunnelse: 'Feilutbetalingen er forårsaket av mottaker',
    aktsomhet: {
        aktsomhet: 'grovtUaktsomt',
        begrunnelse: 'Mottaker handlet grovt uaktsomt',
        erDetSærligeGrunner: {
            erDetSaerligeGrunner: 'nei',
            særligeGrunnerMot: [],
            begrunnelse: 'Ingen særlige grunner',
            annetBegrunnelse: null,
        },
    },
};
const forsettlig: VilkaarsvurderingValg = {
    vurdering: 'forårsaket_av_mottaker',
    begrunnelse: 'Feilutbetalingen er forårsaket av mottaker',
    aktsomhet: {
        aktsomhet: 'forsettlig',
        begrunnelse: 'Mottaker handlet forsettlig',
    },
};
const ikkeVurdert: VilkaarsvurderingValg = { vurdering: 'ikke_vurdert' };

const lagPeriode = (overstyr: Partial<Vilkårsperiode> = {}): Vilkårsperiode => ({
    id: 'periode',
    fom: '01.01.2024',
    tom: '31.01.2024',
    feilutbetalt: 1000,
    vurdering: 'IKKE_VURDERT',
    resultat: null,
    rettsligGrunnlag: [],
    ...overstyr,
});

describe('Vilkårsvurdering - utils', () => {
    describe('utledVurdering', () => {
        test('burde utlede GOD_TRO', () => {
            expect(utledVurdering(godTro)).toBe('GOD_TRO');
        });

        test('burde utlede FORSTO ved forsto_eller_burde_forstått', () => {
            expect(utledVurdering(forstoEllerBurdeForstått)).toBe('FORSTO');
        });

        test('burde utlede UAKTSOMT for forårsaket av mottaker med uaktsomhet', () => {
            expect(utledVurdering(uaktsomt)).toBe('UAKTSOMT');
        });

        test('burde utlede GROVT_UAKTSOMHET for grov uaktsomhet', () => {
            expect(utledVurdering(grovtUaktsomt)).toBe('GROVT_UAKTSOMHET');
        });

        test('burde utlede FORSETT for forsettlig', () => {
            expect(utledVurdering(forsettlig)).toBe('FORSETT');
        });

        test('burde utlede IKKE_VURDERT når valg ikke er vurdert', () => {
            expect(utledVurdering(ikkeVurdert)).toBe('IKKE_VURDERT');
        });
    });

    describe('erPeriodeVurdert', () => {
        test('burde være true for en vurdert periode', () => {
            expect(erPeriodeVurdert(lagPeriode({ vurdering: 'GOD_TRO' }))).toBe(true);
        });

        test('burde være false for en uvurdert periode', () => {
            expect(erPeriodeVurdert(lagPeriode({ vurdering: 'IKKE_VURDERT' }))).toBe(false);
        });
    });

    describe('finnStandardValgtPeriode', () => {
        test('burde returnere undefined for tom liste', () => {
            expect(finnStandardValgtPeriode([])).toBeUndefined();
        });

        test('burde velge den eneste uvurderte perioden', () => {
            const perioder = [lagPeriode({ id: 'eneste', vurdering: 'IKKE_VURDERT' })];

            expect(finnStandardValgtPeriode(perioder)?.id).toBe('eneste');
        });

        test('burde velge den eldste uvurderte perioden når flere er uvurdert', () => {
            const perioder = [
                lagPeriode({ id: 'mars', vurdering: 'IKKE_VURDERT' }),
                lagPeriode({ id: 'april', vurdering: 'IKKE_VURDERT' }),
                lagPeriode({ id: 'mai', vurdering: 'IKKE_VURDERT' }),
            ];

            expect(finnStandardValgtPeriode(perioder)?.id).toBe('mars');
        });

        test('burde velge den eldste uvurderte perioden selv om nyere perioder er vurdert', () => {
            const perioder = [
                lagPeriode({ id: 'mars', vurdering: 'IKKE_VURDERT' }),
                lagPeriode({ id: 'april', vurdering: 'IKKE_VURDERT' }),
                lagPeriode({ id: 'mai', vurdering: 'GOD_TRO' }),
            ];

            expect(finnStandardValgtPeriode(perioder)?.id).toBe('mars');
        });

        test('burde hoppe over uvurderte perioder som er eldre enn en vurdert periode i midten', () => {
            const perioder = [
                lagPeriode({ id: 'mars', vurdering: 'GOD_TRO' }),
                lagPeriode({ id: 'april', vurdering: 'IKKE_VURDERT' }),
                lagPeriode({ id: 'mai', vurdering: 'IKKE_VURDERT' }),
            ];

            expect(finnStandardValgtPeriode(perioder)?.id).toBe('april');
        });

        test('burde velge nyeste (nederste) periode når alle er vurdert', () => {
            const perioder = [
                lagPeriode({ id: 'mars', vurdering: 'FORSETT' }),
                lagPeriode({ id: 'april', vurdering: 'UAKTSOMT' }),
                lagPeriode({ id: 'mai', vurdering: 'GOD_TRO' }),
            ];

            expect(finnStandardValgtPeriode(perioder)?.id).toBe('mai');
        });
    });
});
