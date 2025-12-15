import {
    forhåndsvarselSchema,
    HarBrukerUttaltSeg,
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
                harBrukerUttaltSeg: {
                    harBrukerUttaltSeg: HarBrukerUttaltSeg.Nei,
                    kommentar: 'Bruker har ikke uttalt seg',
                },
            });

            expect(result.success).toBe(true);
        });

        test('Nei: gyldig path', () => {
            const result = forhåndsvarselSchema.safeParse({
                skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Nei,
                harBrukerUttaltSeg: {
                    harBrukerUttaltSeg: HarBrukerUttaltSeg.Nei,
                    kommentar: 'Bruker har ikke uttalt seg',
                },
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
                    harBrukerUttaltSeg: {
                        harBrukerUttaltSeg: HarBrukerUttaltSeg.Nei,
                        kommentar: 'Test',
                    },
                });

                expect(result.error?.issues[0].message).toBe('Du må legge inn minst tre tegn');
            });

            test('skal feile når fritekst er for lang', () => {
                const result = forhåndsvarselSchema.safeParse({
                    skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja,
                    fritekst: 'a'.repeat(4001),
                    harBrukerUttaltSeg: {
                        harBrukerUttaltSeg: HarBrukerUttaltSeg.Nei,
                        kommentar: 'Test',
                    },
                });

                expect(result.error?.issues[0].message).toBe('Maksimalt 4000 tegn tillatt');
            });
        });

        describe('harBrukerUttaltSeg', () => {
            test('IkkeValgt, gir feilmelding', () => {
                const result = forhåndsvarselSchema.safeParse({
                    skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja,
                    fritekst: 'Test',
                    harBrukerUttaltSeg: {
                        harBrukerUttaltSeg: HarBrukerUttaltSeg.IkkeValgt,
                    },
                });

                const error = result.error?.issues.find(i => i.path.includes('harBrukerUttaltSeg'));
                expect(error?.message).toBe(
                    'Du må velge om brukeren har uttalt seg eller om fristen skal utsettes'
                );
            });

            test('Nei, gyldig validering', () => {
                const result = forhåndsvarselSchema.safeParse({
                    skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja,
                    fritekst: 'Test',
                    harBrukerUttaltSeg: {
                        harBrukerUttaltSeg: HarBrukerUttaltSeg.Nei,
                        kommentar: 'Bruker har ikke uttalt seg',
                    },
                });

                expect(result.success).toBe(true);
            });

            test('Nei, feiler med manglende kommentar', () => {
                const result = forhåndsvarselSchema.safeParse({
                    skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja,
                    fritekst: 'Test',
                    harBrukerUttaltSeg: {
                        harBrukerUttaltSeg: HarBrukerUttaltSeg.Nei,
                        kommentar: '',
                    },
                });

                const error = result.error?.issues.find(i => i.path.includes('kommentar'));
                expect(error?.message).toBe('Du må legge inn minst tre tegn');
            });

            test('Ja, gyldig validering', () => {
                const result = forhåndsvarselSchema.safeParse({
                    skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja,
                    fritekst: 'Test',
                    harBrukerUttaltSeg: {
                        harBrukerUttaltSeg: HarBrukerUttaltSeg.Ja,
                        uttalelsesDetaljer: [
                            {
                                uttalelsesdato: '2024-01-15',
                                hvorBrukerenUttalteSeg: 'Telefon',
                                uttalelseBeskrivelse: 'Bruker bekrefter mottatt varsel',
                            },
                        ],
                    },
                });

                expect(result.success).toBe(true);
            });

            test('Ja, feiler med ugyldig dato', () => {
                const result = forhåndsvarselSchema.safeParse({
                    skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja,
                    fritekst: 'Test',
                    harBrukerUttaltSeg: {
                        harBrukerUttaltSeg: HarBrukerUttaltSeg.Ja,
                        uttalelsesDetaljer: [
                            {
                                uttalelsesdato: 'ugyldig-dato',
                                hvorBrukerenUttalteSeg: 'Modia',
                                uttalelseBeskrivelse: 'Test',
                            },
                        ],
                    },
                });

                const error = result.error?.issues.find(i => i.path.includes('uttalelsesdato'));
                expect(error?.message).toBe('Du må legge inn en gyldig dato');
            });

            test('Utsett frist, gyldig validering', () => {
                const result = forhåndsvarselSchema.safeParse({
                    skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja,
                    fritekst: 'Test',
                    harBrukerUttaltSeg: {
                        harBrukerUttaltSeg: HarBrukerUttaltSeg.UtsettFrist,
                        utsettUttalelseFrist: {
                            nyFrist: '2024-02-15',
                            begrunnelse: 'Bruker trenger mer tid til å skaffe dokumentasjon',
                        },
                    },
                });

                expect(result.success).toBe(true);
            });

            test('Utsett frist, feiler med ugyldig dato', () => {
                const result = forhåndsvarselSchema.safeParse({
                    skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja,
                    fritekst: 'Test',
                    harBrukerUttaltSeg: {
                        harBrukerUttaltSeg: HarBrukerUttaltSeg.UtsettFrist,
                        utsettUttalelseFrist: {
                            nyFrist: 'ikke-en-dato',
                            begrunnelse: 'Test begrunnelse',
                        },
                    },
                });

                const error = result.error?.issues.find(i => i.path.includes('nyFrist'));
                expect(error?.message).toBe('Du må legge inn en gyldig dato');
            });

            test('Utsett frist, feiler uten begrunnelse', () => {
                const result = forhåndsvarselSchema.safeParse({
                    skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja,
                    fritekst: 'Test',
                    harBrukerUttaltSeg: {
                        harBrukerUttaltSeg: HarBrukerUttaltSeg.UtsettFrist,
                        utsettUttalelseFrist: {
                            nyFrist: '2024-02-15',
                            begrunnelse: '',
                        },
                    },
                });

                const error = result.error?.issues.find(i => i.path.includes('begrunnelse'));
                expect(error?.message).toBe('Du må legge inn minst tre tegn');
            });
        });
    });
});
