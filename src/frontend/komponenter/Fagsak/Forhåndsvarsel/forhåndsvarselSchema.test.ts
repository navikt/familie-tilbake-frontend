import {
    forhåndsvarselSchema,
    uttalelseMedFristSchema,
    HarUttaltSeg,
    SkalSendesForhåndsvarsel,
} from './forhåndsvarselSchema';

describe('Validering av forhåndsvarsel-skjema', () => {
    describe('Første spørsmål: skal sende forhåndsvarsel', () => {
        test('IkkeValgt: gir feilmelding', () => {
            const result = forhåndsvarselSchema.safeParse({
                skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.IkkeValgt,
            });

            expect(result.error?.issues[0].message).toBe(
                'Du må velge om forhåndsvarselet skal sendes eller ikke'
            );
        });

        test('Ja: gyldig path', () => {
            const result = forhåndsvarselSchema.safeParse({
                skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja,
                fritekst: 'Dette er en gyldig fritekst',
            });

            expect(result.success).toBe(true);
        });

        test('Nei: gyldig path', () => {
            const result = forhåndsvarselSchema.safeParse({
                skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Nei,
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Ja', () => {
        describe('fritekst', () => {
            test('skal feile når fritekst mangler', () => {
                const result = forhåndsvarselSchema.safeParse({
                    skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja,
                    fritekst: '',
                });

                expect(result.error?.issues[0].message).toBe('Du må legge inn minst tre tegn');
            });

            test('skal feile når fritekst er for lang', () => {
                const result = forhåndsvarselSchema.safeParse({
                    skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja,
                    fritekst: 'a'.repeat(4001),
                });

                expect(result.error?.issues[0].message).toBe('Maksimalt 4000 tegn tillatt');
            });
        });
    });
    describe('Uttalelse', () => {
        describe('harUttaltSeg', () => {
            test('IkkeValgt, gir feilmelding', () => {
                const result = uttalelseMedFristSchema.safeParse({
                    harUttaltSeg: HarUttaltSeg.IkkeValgt,
                });

                const error = result.error?.issues.find(i => i.path.includes('harUttaltSeg'));
                expect(error?.message).toBe(
                    'Du må velge om brukeren har uttalt seg eller om fristen skal utsettes'
                );
            });

            test('Nei, gyldig validering', () => {
                const result = uttalelseMedFristSchema.safeParse({
                    harUttaltSeg: HarUttaltSeg.Nei,
                    kommentar: 'Bruker har ikke uttalt seg',
                });

                expect(result.success).toBe(true);
            });

            test('Nei, feiler med manglende kommentar', () => {
                const result = uttalelseMedFristSchema.safeParse({
                    harUttaltSeg: HarUttaltSeg.Nei,
                    kommentar: '',
                });

                const error = result.error?.issues.find(i => i.path.includes('kommentar'));
                expect(error?.message).toBe('Du må legge inn minst tre tegn');
            });

            test('Ja, gyldig validering', () => {
                const result = uttalelseMedFristSchema.safeParse({
                    harUttaltSeg: HarUttaltSeg.Ja,
                    uttalelsesDetaljer: [
                        {
                            uttalelsesdato: '2024-01-15',
                            hvorBrukerenUttalteSeg: 'Telefon',
                            uttalelseBeskrivelse: 'Bruker bekrefter mottatt varsel',
                        },
                    ],
                });

                expect(result.success).toBe(true);
            });

            test('Ja, feiler med ugyldig dato', () => {
                const result = uttalelseMedFristSchema.safeParse({
                    harUttaltSeg: HarUttaltSeg.Ja,
                    uttalelsesDetaljer: [
                        {
                            uttalelsesdato: 'ugyldig-dato',
                            hvorBrukerenUttalteSeg: 'Modia',
                            uttalelseBeskrivelse: 'Test',
                        },
                    ],
                });

                const error = result.error?.issues.find(i => i.path.includes('uttalelsesdato'));
                expect(error?.message).toBe('Du må legge inn en gyldig dato');
            });

            test('Utsett frist, gyldig validering', () => {
                const result = uttalelseMedFristSchema.safeParse({
                    harUttaltSeg: HarUttaltSeg.UtsettFrist,
                    utsettUttalelseFrist: {
                        nyFrist: '2024-02-15',
                        begrunnelse: 'Bruker trenger mer tid til å skaffe dokumentasjon',
                    },
                });

                expect(result.success).toBe(true);
            });

            test('Utsett frist, feiler med ugyldig dato', () => {
                const result = uttalelseMedFristSchema.safeParse({
                    harUttaltSeg: HarUttaltSeg.UtsettFrist,
                    utsettUttalelseFrist: {
                        nyFrist: 'ikke-en-dato',
                        begrunnelse: 'Test begrunnelse',
                    },
                });

                const error = result.error?.issues.find(i => i.path.includes('nyFrist'));
                expect(error?.message).toBe('Du må legge inn en gyldig dato');
            });

            test('Utsett frist, feiler uten begrunnelse', () => {
                const result = uttalelseMedFristSchema.safeParse({
                    harUttaltSeg: HarUttaltSeg.UtsettFrist,
                    utsettUttalelseFrist: {
                        nyFrist: '2024-02-15',
                        begrunnelse: '',
                    },
                });

                const error = result.error?.issues.find(i => i.path.includes('begrunnelse'));
                expect(error?.message).toBe('Du må legge inn minst tre tegn');
            });
        });
    });
});
