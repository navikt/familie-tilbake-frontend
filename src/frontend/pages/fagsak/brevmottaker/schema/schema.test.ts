import type { BrevmottakerFormData } from './schema';

import { AdresseKilde, MottakerType } from '~/typer/Brevmottaker';

import { brevmottakerFormDataInputSchema } from './schema';

describe('brevmottakerSchema', () => {
    const expectValidationError = (
        result: { success: boolean; error?: { issues: { message: string }[] } },
        expectedMessage: string
    ): void => {
        expect(result.success).toBe(false);
        if (!result.success) {
            const hasExpectedError = result.error?.issues.some((issue: { message: string }) =>
                issue.message.includes(expectedMessage)
            );
            expect(hasExpectedError).toBe(true);
        }
    };

    const testNorskAdresseValidering = (
        validNorgeData: BrevmottakerFormData,
        mottakerKey: keyof BrevmottakerFormData
    ): void => {
        test('Validerer gyldig norsk adresse', () => {
            const result = brevmottakerFormDataInputSchema.safeParse(validNorgeData);
            expect(result.success).toBe(true);
        });

        test('Postnummer påkrevd og skal være 4 siffer', () => {
            const mottakerData = validNorgeData[mottakerKey] as Record<string, unknown>;
            const invalidData = {
                ...validNorgeData,
                [mottakerKey]: {
                    ...mottakerData,
                    postnummer: '',
                },
            };
            const result = brevmottakerFormDataInputSchema.safeParse(invalidData);
            expectValidationError(result, 'Postnummer må være 4 siffer');
        });

        test('Avviser ugyldig postnummer format', () => {
            const mottakerData = validNorgeData[mottakerKey] as Record<string, unknown>;
            const invalidData = {
                ...validNorgeData,
                [mottakerKey]: {
                    ...mottakerData,
                    postnummer: '123',
                },
            };
            const result = brevmottakerFormDataInputSchema.safeParse(invalidData);
            expectValidationError(result, 'Postnummer må være 4 siffer');
        });

        test('Poststed påkrevd', () => {
            const mottakerData = validNorgeData[mottakerKey] as Record<string, unknown>;
            const invalidData = {
                ...validNorgeData,
                [mottakerKey]: {
                    ...mottakerData,
                    poststed: '',
                },
            };
            const result = brevmottakerFormDataInputSchema.safeParse(invalidData);
            expectValidationError(result, 'Poststed er påkrevd');
        });
    };

    const testFødselsnummerValidering = (
        validPersonData: BrevmottakerFormData,
        mottakerKey: keyof BrevmottakerFormData
    ): void => {
        test('Validerer gyldig data', () => {
            const result = brevmottakerFormDataInputSchema.safeParse(validPersonData);
            expect(result.success).toBe(true);
        });

        test('Fødselsnummer påkrevd og må være 11 siffer', () => {
            const mottakerData = validPersonData[mottakerKey] as Record<string, unknown>;
            const invalidData = {
                ...validPersonData,
                [mottakerKey]: {
                    ...mottakerData,
                    fødselsnummer: '123456789',
                },
            };
            const result = brevmottakerFormDataInputSchema.safeParse(invalidData);
            expectValidationError(result, 'Fødselsnummer må være 11 sammenhengende siffer');
        });

        test('Avviser ikke-numerisk fødselsnummer', () => {
            const mottakerData = validPersonData[mottakerKey] as Record<string, unknown>;
            const invalidData = {
                ...validPersonData,
                [mottakerKey]: {
                    ...mottakerData,
                    fødselsnummer: '1234567890a',
                },
            };
            const result = brevmottakerFormDataInputSchema.safeParse(invalidData);
            expectValidationError(result, 'Fødselsnummer må være 11 sammenhengende siffer');
        });
    };

    const testAdresselinje1Påkrevd = (
        validData: BrevmottakerFormData,
        mottakerKey: keyof BrevmottakerFormData
    ): void => {
        test('Adresselinje 1 påkrevd', () => {
            const mottakerData = validData[mottakerKey] as Record<string, unknown>;
            const invalidData = {
                ...validData,
                [mottakerKey]: {
                    ...mottakerData,
                    adresselinje1: '',
                },
            };
            const result = brevmottakerFormDataInputSchema.safeParse(invalidData);
            expectValidationError(result, 'Adresselinje 1 er påkrevd');
        });
    };

    describe('Bruker med utenlandsk adresse', () => {
        const validData: BrevmottakerFormData = {
            mottakerType: MottakerType.BrukerMedUtenlandskAdresse,
            brukerMedUtenlandskAdresse: {
                navn: 'Test Bruker',
                land: 'SE',
                adresselinje1: 'Test Gate 123',
                adresselinje2: 'Leilighet 4B',
            },
        };

        test('Validerer gyldig data', () => {
            const result = brevmottakerFormDataInputSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        test('Avviser data uten adresse informasjon', () => {
            const invalidData = {
                mottakerType: MottakerType.BrukerMedUtenlandskAdresse,
            };

            const result = brevmottakerFormDataInputSchema.safeParse(invalidData);
            expectValidationError(result, 'Mangler data for valgt mottakertype');
        });

        test('Adresselinje 1 påkrevd', () => {
            const invalidData = {
                ...validData,
                brukerMedUtenlandskAdresse: {
                    ...validData.brukerMedUtenlandskAdresse,
                    adresselinje1: '',
                },
            };

            const result = brevmottakerFormDataInputSchema.safeParse(invalidData);
            expectValidationError(result, 'Adresselinje 1 er påkrevd');
        });
    });

    describe('Fullmektig', () => {
        describe('Manuell registrering', () => {
            const validManuellData: BrevmottakerFormData = {
                mottakerType: MottakerType.Fullmektig,
                fullmektig: {
                    adresseKilde: AdresseKilde.ManuellRegistrering,
                    navn: 'Test Fullmektig',
                    land: 'SE',
                    adresselinje1: 'Test Gate 123',
                    adresselinje2: 'Leilighet 4B',
                },
            };

            test('Validerer gyldig data', () => {
                const result = brevmottakerFormDataInputSchema.safeParse(validManuellData);
                expect(result.success).toBe(true);
            });

            testAdresselinje1Påkrevd(validManuellData, 'fullmektig');

            describe('Hvis Norge valgt', () => {
                const validNorgeData: BrevmottakerFormData = {
                    mottakerType: MottakerType.Fullmektig,
                    fullmektig: {
                        adresseKilde: AdresseKilde.ManuellRegistrering,
                        navn: 'Test Fullmektig',
                        land: 'NO',
                        adresselinje1: 'Test Gate 123',
                        postnummer: '0123',
                        poststed: 'Oslo',
                    },
                };

                testNorskAdresseValidering(validNorgeData, 'fullmektig');
            });
        });

        describe('Oppslag i personregister', () => {
            const validPersonregisterData: BrevmottakerFormData = {
                mottakerType: MottakerType.Fullmektig,
                fullmektig: {
                    adresseKilde: AdresseKilde.OppslagRegister,
                    fødselsnummer: '12345678901',
                },
            };

            testFødselsnummerValidering(validPersonregisterData, 'fullmektig');
        });

        describe('Oppslag i organisasjonsregister', () => {
            const validOrgData: BrevmottakerFormData = {
                mottakerType: MottakerType.Fullmektig,
                fullmektig: {
                    adresseKilde: AdresseKilde.OppslagOrganisasjonsregister,
                    organisasjonsnummer: '123456789',
                },
            };

            test('Validerer gyldig data uten kontaktperson', () => {
                const result = brevmottakerFormDataInputSchema.safeParse(validOrgData);
                expect(result.success).toBe(true);
            });

            test('Validerer gyldig data med kontaktperson', () => {
                const dataWithContact = {
                    ...validOrgData,
                    fullmektig: {
                        ...validOrgData.fullmektig,
                        navn: 'Test Kontaktperson',
                    },
                };

                const result = brevmottakerFormDataInputSchema.safeParse(dataWithContact);
                expect(result.success).toBe(true);
            });

            test('Organisasjonsnummer påkrevd og må være 9 siffer', () => {
                const invalidData = {
                    ...validOrgData,
                    fullmektig: {
                        ...validOrgData.fullmektig,
                        organisasjonsnummer: '12345678',
                    },
                };

                const result = brevmottakerFormDataInputSchema.safeParse(invalidData);
                expectValidationError(
                    result,
                    'Organisasjonsnummer må være 9 sammenhengende siffer'
                );
            });
        });
    });

    describe('Verge', () => {
        describe('Manuell registrering', () => {
            const validManuellData: BrevmottakerFormData = {
                mottakerType: MottakerType.Verge,
                verge: {
                    adresseKilde: AdresseKilde.ManuellRegistrering,
                    navn: 'Test Verge',
                    land: 'SE',
                    adresselinje1: 'Test Gate 123',
                    adresselinje2: 'Leilighet 4B',
                },
            };

            test('Validerer gyldig data', () => {
                const result = brevmottakerFormDataInputSchema.safeParse(validManuellData);
                expect(result.success).toBe(true);
            });

            testAdresselinje1Påkrevd(validManuellData, 'verge');

            describe('Hvis Norge valgt', () => {
                const validNorgeData: BrevmottakerFormData = {
                    mottakerType: MottakerType.Verge,
                    verge: {
                        adresseKilde: AdresseKilde.ManuellRegistrering,
                        navn: 'Test Verge',
                        land: 'NO',
                        adresselinje1: 'Test Gate 123',
                        postnummer: '0123',
                        poststed: 'Oslo',
                    },
                };

                testNorskAdresseValidering(validNorgeData, 'verge');
            });
        });

        describe('Oppslag i personregister', () => {
            const validPersonregisterData: BrevmottakerFormData = {
                mottakerType: MottakerType.Verge,
                verge: {
                    adresseKilde: AdresseKilde.OppslagRegister,
                    fødselsnummer: '12345678901',
                },
            };

            testFødselsnummerValidering(validPersonregisterData, 'verge');
        });
    });

    describe('Dødsbo', () => {
        describe('Manuell registrering', () => {
            const validManuellData: BrevmottakerFormData = {
                mottakerType: MottakerType.Dødsbo,
                dødsbo: {
                    navn: 'Test Bruker v/dødsbo',
                    land: 'SE',
                    adresselinje1: 'Test Gate 123',
                    adresselinje2: 'Leilighet 4B',
                },
            };

            test('Validerer gyldig data', () => {
                const result = brevmottakerFormDataInputSchema.safeParse(validManuellData);
                expect(result.success).toBe(true);
            });

            testAdresselinje1Påkrevd(validManuellData, 'dødsbo');

            describe('Hvis Norge valgt', () => {
                const validNorgeData: BrevmottakerFormData = {
                    mottakerType: MottakerType.Dødsbo,
                    dødsbo: {
                        navn: 'Test Bruker v/dødsbo',
                        land: 'NO',
                        adresselinje1: 'Test Gate 123',
                        postnummer: '0123',
                        poststed: 'Oslo',
                    },
                };

                testNorskAdresseValidering(validNorgeData, 'dødsbo');
            });
        });
    });
});
