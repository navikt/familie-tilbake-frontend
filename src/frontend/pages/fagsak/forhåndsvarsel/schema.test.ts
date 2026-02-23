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
});
