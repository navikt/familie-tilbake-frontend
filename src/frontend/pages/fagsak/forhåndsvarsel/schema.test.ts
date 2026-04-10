import { configureZod } from '~/utils/zodConfig';

import {
    forhåndsvarselSchema,
    uttalelseSchema,
    HarUttaltSeg,
    SkalSendesForhåndsvarsel,
} from './schema';

beforeAll(() => {
    configureZod();
});

describe('Overskriving av feilmeldinger i forhåndsvarsel-skjema', () => {
    test('skalSendesForhåndsvarsel', () => {
        const result = forhåndsvarselSchema.safeParse({
            skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.IkkeValgt,
        });

        expect(result.error?.issues[0].message).toBe(
            'Du må velge om forhåndsvarselet skal sendes eller ikke'
        );
    });

    test('begrunnelseForUnntak', () => {
        const result = forhåndsvarselSchema.safeParse({
            skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Nei,
            begrunnelseForUnntak: undefined,
            beskrivelse: 'Gyldig beskrivelse',
        });

        const error = result.error?.issues.find(i => i.path.includes('begrunnelseForUnntak'));
        expect(error?.message).toBe('Du må velge en begrunnelse for unntak fra forhåndsvarsel');
    });

    test('harUttaltSeg', () => {
        const result = uttalelseSchema.safeParse({
            harUttaltSeg: HarUttaltSeg.IkkeValgt,
        });

        const error = result.error?.issues.find(i => i.path.includes('harUttaltSeg'));
        expect(error?.message).toBe('Du må velge om brukeren har uttalt seg');
    });

    test('utsettUttalelseFrist nyFrist', () => {
        const result = uttalelseSchema.safeParse({
            harUttaltSeg: HarUttaltSeg.UtsettFrist,
            utsettUttalelseFrist: {
                nyFrist: undefined,
                begrunnelse: 'En begrunnelse',
            },
        });

        const error = result.error?.issues.find(i => i.path.includes('nyFrist'));
        expect(error?.message).toBe('Du må velge en ny frist');
    });

    test('utsettUttalelseFrist begrunnelse', () => {
        const result = uttalelseSchema.safeParse({
            harUttaltSeg: HarUttaltSeg.UtsettFrist,
            utsettUttalelseFrist: {
                nyFrist: '2099-06-01',
                begrunnelse: '',
            },
        });

        const error = result.error?.issues.find(i => i.path.includes('begrunnelse'));
        expect(error).toBeDefined();
    });

    test('gyldig utsettUttalelseFrist', () => {
        const result = uttalelseSchema.safeParse({
            harUttaltSeg: HarUttaltSeg.UtsettFrist,
            utsettUttalelseFrist: {
                nyFrist: '2099-06-01',
                begrunnelse: 'Brukeren trenger mer tid',
            },
        });

        expect(result.success).toBe(true);
    });
});
