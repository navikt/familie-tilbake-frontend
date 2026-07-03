import type { SammenslåbarPeriode } from './utils';

import { finnSammenslåingsforslag } from './utils';

// Eldste periode (A) med to delbare perioder, nyeste periode (B) med to delbare perioder.
const periodeA: SammenslåbarPeriode = {
    periodeId: 'A',
    periode: { fom: '2024-01-01', tom: '2024-02-29' },
    delbarePerioder: [
        { periodeId: 'A1', periode: { fom: '2024-01-01', tom: '2024-01-31' } },
        { periodeId: 'A2', periode: { fom: '2024-02-01', tom: '2024-02-29' } },
    ],
};
const periodeB: SammenslåbarPeriode = {
    periodeId: 'B',
    periode: { fom: '2024-03-01', tom: '2024-04-30' },
    delbarePerioder: [
        { periodeId: 'B1', periode: { fom: '2024-03-01', tom: '2024-03-31' } },
        { periodeId: 'B2', periode: { fom: '2024-04-01', tom: '2024-04-30' } },
    ],
};

describe('finnSammenslåingsforslag', () => {
    test('Skal koble den eldste delbare på gjeldende periode med den nyeste delbare på forrige periode', () => {
        const forslag = finnSammenslåingsforslag([periodeA, periodeB], 'B');

        expect(forslag?.sammenslaaing).toEqual({
            vilkårsvurderingId: 'B1',
            slåesSammenMedId: 'A2',
        });
    });

    test('Skal returnere forrige (eldste) periode i forslaget', () => {
        const forslag = finnSammenslåingsforslag([periodeA, periodeB], 'B');

        expect(forslag?.forrigePeriode).toBe(periodeA);
    });

    test('Skal returnere undefined for den eldste perioden (ingen tidligere periode)', () => {
        const forslag = finnSammenslåingsforslag([periodeA, periodeB], 'A');

        expect(forslag).toBeUndefined();
    });

    test('Skal gi samme resultat uavhengig av rekkefølge i input', () => {
        const forslag = finnSammenslåingsforslag([periodeB, periodeA], 'B');

        expect(forslag?.sammenslaaing).toEqual({
            vilkårsvurderingId: 'B1',
            slåesSammenMedId: 'A2',
        });
    });

    test('Skal bruke periodens egen id når den ikke har flere delbare perioder', () => {
        const enkelForrige: SammenslåbarPeriode = {
            periodeId: 'X',
            periode: { fom: '2024-01-01', tom: '2024-01-31' },
            delbarePerioder: [
                { periodeId: 'X', periode: { fom: '2024-01-01', tom: '2024-01-31' } },
            ],
        };
        const enkelGjeldende: SammenslåbarPeriode = {
            periodeId: 'Y',
            periode: { fom: '2024-02-01', tom: '2024-02-29' },
            delbarePerioder: [
                { periodeId: 'Y', periode: { fom: '2024-02-01', tom: '2024-02-29' } },
            ],
        };

        const forslag = finnSammenslåingsforslag([enkelForrige, enkelGjeldende], 'Y');

        expect(forslag?.sammenslaaing).toEqual({
            vilkårsvurderingId: 'Y',
            slåesSammenMedId: 'X',
        });
    });

    test('Skal returnere undefined når perioden ikke finnes', () => {
        const forslag = finnSammenslåingsforslag([periodeA, periodeB], 'finnes-ikke');

        expect(forslag).toBeUndefined();
    });
});
