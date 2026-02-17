import type { Brevmottaker, TypeEnum } from '../../../../generated';

import { z } from 'zod';

import { Vergetype as VergetypeEnum } from '../../../../kodeverk/verge';
import { AdresseKilde, MottakerType } from '../../../../typer/Brevmottaker';
import { isNumeric } from '../../../../utils';

const TYPE_ENUM_VALUES: TypeEnum[] = [
    'BRUKER_MED_UTENLANDSK_ADRESSE',
    'FULLMEKTIG',
    'VERGE',
    'DØDSBO',
];

const BACKEND_PLACEHOLDERS = {
    DEFAULT_NAVN: ' ',
} as const;

const navnSchema = z
    .string()
    .min(1, 'Navn på person eller organisasjon er påkrevd')
    .max(80, 'Navn kan ikke inneholde mer enn 80 tegn');

const adresselinje1Schema = z
    .string()
    .nullable()
    .default('')
    .refine(val => val && val.trim().length > 0, 'Adresselinje 1 er påkrevd')
    .refine(val => !val || val.length <= 80, 'Adresselinje 1 kan ikke inneholde mer enn 80 tegn');

const adresselinje2Schema = z
    .string()
    .max(80, 'Adresselinje 2 kan ikke inneholde mer enn 80 tegn')
    .optional();

const brukerMedUtenlandskAdresseSchema = z.object({
    navn: navnSchema,
    land: z.string({ error: 'Land er påkrevd' }).min(1, 'Land er påkrevd'),
    adresselinje1: adresselinje1Schema,
    adresselinje2: adresselinje2Schema,
});

const dødsboSchema = z
    .object({
        navn: navnSchema,
        land: z.string({ error: 'Land er påkrevd' }).min(1, 'Land er påkrevd'),
        adresselinje1: adresselinje1Schema,
        adresselinje2: adresselinje2Schema,
        postnummer: z.string().optional(),
        poststed: z.string().optional(),
    })
    .refine(
        data => {
            if (data.land === 'NO') {
                return data.postnummer && z.string().length(4).safeParse(data.postnummer).success;
            }
            return true;
        },
        {
            message: 'Postnummer må være 4 siffer',
            path: ['postnummer'],
        }
    )
    .refine(
        data => {
            if (data.land === 'NO') {
                return data.poststed && z.string().min(1).safeParse(data.poststed.trim()).success;
            }
            return true;
        },
        {
            message: 'Poststed er påkrevd',
            path: ['poststed'],
        }
    );

const fullmektigSchema = z
    .object({
        adresseKilde: z.enum(
            [
                AdresseKilde.ManuellRegistrering,
                AdresseKilde.OppslagRegister,
                AdresseKilde.OppslagOrganisasjonsregister,
            ],
            { error: 'Du må velge en adressetype' }
        ),
        fødselsnummer: z.string().optional(),
        organisasjonsnummer: z.string().optional(),
        navn: z.string().optional(),
        land: z.string().optional(),
        adresselinje1: z.string().optional(),
        adresselinje2: adresselinje2Schema.optional(),
        postnummer: z.string().optional(),
        poststed: z.string().optional(),
    })
    .refine(
        data => {
            if (data.adresseKilde === AdresseKilde.OppslagRegister) {
                return (
                    data.fødselsnummer &&
                    data.fødselsnummer.length === 11 &&
                    isNumeric(data.fødselsnummer)
                );
            }
            return true;
        },
        {
            message: 'Fødselsnummer må være 11 sammenhengende siffer',
            path: ['fødselsnummer'],
        }
    )
    .refine(
        data => {
            if (data.adresseKilde === AdresseKilde.OppslagOrganisasjonsregister) {
                return (
                    data.organisasjonsnummer &&
                    data.organisasjonsnummer.length === 9 &&
                    isNumeric(data.organisasjonsnummer)
                );
            }
            return true;
        },
        {
            message: 'Organisasjonsnummer må være 9 sammenhengende siffer',
            path: ['organisasjonsnummer'],
        }
    )
    .refine(
        data => {
            if (data.adresseKilde === AdresseKilde.ManuellRegistrering) {
                return data.navn && data.navn.trim().length > 0;
            }
            return true;
        },
        {
            message: 'Navn på person er påkrevd',
            path: ['navn'],
        }
    )
    .refine(
        data => {
            if (data.adresseKilde === AdresseKilde.ManuellRegistrering) {
                return data.land && data.land.trim().length > 0;
            }
            return true;
        },
        {
            message: 'Land er påkrevd',
            path: ['land'],
        }
    )
    .refine(
        data => {
            if (data.adresseKilde === AdresseKilde.ManuellRegistrering) {
                return data.adresselinje1 && data.adresselinje1.trim().length > 0;
            }
            return true;
        },
        {
            message: 'Adresselinje 1 er påkrevd',
            path: ['adresselinje1'],
        }
    )
    .refine(
        data => {
            if (data.adresseKilde === AdresseKilde.ManuellRegistrering && data.land === 'NO') {
                return (
                    data.postnummer && data.postnummer.length === 4 && isNumeric(data.postnummer)
                );
            }
            return true;
        },
        {
            message: 'Postnummer må være 4 siffer',
            path: ['postnummer'],
        }
    )
    .refine(
        data => {
            if (data.adresseKilde === AdresseKilde.ManuellRegistrering && data.land === 'NO') {
                return data.poststed && data.poststed.trim().length > 0;
            }
            return true;
        },
        {
            message: 'Poststed er påkrevd',
            path: ['poststed'],
        }
    );

const vergeSchema = z
    .object({
        adresseKilde: z.enum([AdresseKilde.ManuellRegistrering, AdresseKilde.OppslagRegister], {
            error: 'Du må velge en adressetype',
        }),
        fødselsnummer: z.string().optional(),
        navn: z.string().optional(),
        land: z.string().optional(),
        adresselinje1: z.string().optional(),
        adresselinje2: z.string().optional(),
        postnummer: z.string().optional(),
        poststed: z.string().optional(),
    })
    .refine(
        data => {
            if (data.adresseKilde === AdresseKilde.OppslagRegister) {
                return (
                    data.fødselsnummer &&
                    data.fødselsnummer.length === 11 &&
                    isNumeric(data.fødselsnummer)
                );
            }
            return true;
        },
        {
            message: 'Fødselsnummer må være 11 sammenhengende siffer',
            path: ['fødselsnummer'],
        }
    )
    .refine(
        data => {
            if (data.adresseKilde === AdresseKilde.ManuellRegistrering) {
                return data.navn && data.navn.trim().length > 0;
            }
            return true;
        },
        {
            message: 'Navn på person er påkrevd',
            path: ['navn'],
        }
    )
    .refine(
        data => {
            if (data.adresseKilde === AdresseKilde.ManuellRegistrering) {
                return data.land && data.land.trim().length > 0;
            }
            return true;
        },
        {
            message: 'Land er påkrevd',
            path: ['land'],
        }
    )
    .refine(
        data => {
            if (data.adresseKilde === AdresseKilde.ManuellRegistrering) {
                return data.adresselinje1 && data.adresselinje1.trim().length > 0;
            }
            return true;
        },
        {
            message: 'Adresselinje 1 er påkrevd',
            path: ['adresselinje1'],
        }
    )
    .refine(
        data => {
            if (data.adresseKilde === AdresseKilde.ManuellRegistrering && data.land === 'NO') {
                return (
                    data.postnummer && data.postnummer.length === 4 && isNumeric(data.postnummer)
                );
            }
            return true;
        },
        {
            message: 'Postnummer må være 4 siffer',
            path: ['postnummer'],
        }
    )
    .refine(
        data => {
            if (data.adresseKilde === AdresseKilde.ManuellRegistrering && data.land === 'NO') {
                return data.poststed && data.poststed.trim().length > 0;
            }
            return true;
        },
        {
            message: 'Poststed er påkrevd',
            path: ['poststed'],
        }
    );

export const brevmottakerFormDataInputSchema = z
    .object({
        mottakerType: z
            .string()
            .min(1, 'Det må velges en mottakertype')
            .refine(
                val => TYPE_ENUM_VALUES.includes(val as TypeEnum),
                'Det må velges en gyldig mottakertype'
            )
            .transform(val => val as TypeEnum),
        brukerMedUtenlandskAdresse: brukerMedUtenlandskAdresseSchema.optional(),
        fullmektig: fullmektigSchema.optional(),
        verge: vergeSchema.optional(),
        dødsbo: dødsboSchema.optional(),
    })
    .refine(
        data => {
            // Valider at riktig mottakertype har data
            switch (data.mottakerType) {
                case MottakerType.BrukerMedUtenlandskAdresse:
                    return data.brukerMedUtenlandskAdresse != null;
                case MottakerType.Fullmektig:
                    return data.fullmektig != null;
                case MottakerType.Verge:
                    return data.verge != null;
                case MottakerType.Dødsbo:
                    return data.dødsbo != null;
                default:
                    return false;
            }
        },
        {
            message: 'Mangler data for valgt mottakertype',
            path: ['mottakerType'],
        }
    );

export const brevmottakerFormDataSchema = brevmottakerFormDataInputSchema.transform(
    (data): Brevmottaker => {
        return mapFormDataToBrevmottaker(data, data.mottakerType);
    }
);

type AdresseDataUnion =
    | BrukerMedUtenlandskAdresseData
    | DødsboData
    | FullmektigData
    | VergeData
    | null
    | undefined;

const withNullCheck =
    <T extends NonNullable<AdresseDataUnion>>(
        predicate: (data: NonNullable<AdresseDataUnion>) => data is T
    ) =>
    (data: AdresseDataUnion): data is T => {
        return data != null && predicate(data);
    };

const isBrukerMedUtenlandskAdresse = withNullCheck<BrukerMedUtenlandskAdresseData>(
    (data): data is BrukerMedUtenlandskAdresseData => 'land' in data && !('adresseKilde' in data)
);

const isDødsbo = withNullCheck<DødsboData>(
    (data): data is DødsboData =>
        !('adresseKilde' in data) &&
        'navn' in data &&
        'land' in data &&
        'adresselinje1' in data &&
        ('postnummer' in data || 'poststed' in data)
);

const isRegisterOppslag = withNullCheck<RegisterOppslag>(
    (data): data is RegisterOppslag =>
        'adresseKilde' in data &&
        data.adresseKilde === AdresseKilde.OppslagRegister &&
        'fødselsnummer' in data
);

const isOrganisasjonsregisterOppslag = withNullCheck<OrganisasjonsregisterOppslag>(
    (data): data is OrganisasjonsregisterOppslag =>
        'adresseKilde' in data &&
        data.adresseKilde === AdresseKilde.OppslagOrganisasjonsregister &&
        'organisasjonsnummer' in data
);

const isManuellAdresse = withNullCheck<FullmektigData | VergeData>(
    (data): data is FullmektigData | VergeData =>
        'adresseKilde' in data &&
        data.adresseKilde === AdresseKilde.ManuellRegistrering &&
        'land' in data &&
        'adresselinje1' in data
);

const getManuellAdresseInfo = (
    adresseData: AdresseDataUnion
): Brevmottaker['manuellAdresseInfo'] => {
    if (isBrukerMedUtenlandskAdresse(adresseData)) {
        return {
            adresselinje1: adresseData.adresselinje1 || '',
            adresselinje2: adresseData.adresselinje2,
            postnummer: '',
            poststed: '',
            landkode: adresseData.land,
        };
    }
    if (isDødsbo(adresseData)) {
        return {
            adresselinje1: adresseData.adresselinje1,
            adresselinje2: adresseData.adresselinje2,
            postnummer: adresseData.postnummer ?? '',
            poststed: adresseData.poststed ?? '',
            landkode: adresseData.land,
        };
    }
    if (isManuellAdresse(adresseData)) {
        return {
            adresselinje1: adresseData.adresselinje1 || '',
            adresselinje2: adresseData.adresselinje2,
            postnummer: adresseData.postnummer || '',
            poststed: adresseData.poststed || '',
            landkode: adresseData.land || '',
        };
    }
    return undefined;
};

const flattenFormData = (
    data: z.infer<typeof brevmottakerFormDataInputSchema>
): {
    type: TypeEnum;
    adresseData: AdresseDataUnion;
} => {
    const { mottakerType, ...adresseFields } = data;

    const adresseData = Object.values(adresseFields).find(Boolean) || null;

    return {
        type: mottakerType,
        adresseData,
    };
};

const mapFormDataToBrevmottaker = (
    data: z.infer<typeof brevmottakerFormDataInputSchema>,
    type: TypeEnum
): Brevmottaker => {
    const { adresseData } = flattenFormData(data);

    const navn = ((): string => {
        if (isBrukerMedUtenlandskAdresse(adresseData) || isDødsbo(adresseData)) {
            return adresseData.navn;
        }
        if (isOrganisasjonsregisterOppslag(adresseData)) {
            return adresseData?.navn || BACKEND_PLACEHOLDERS.DEFAULT_NAVN;
        }
        if (isManuellAdresse(adresseData)) {
            return adresseData.navn || BACKEND_PLACEHOLDERS.DEFAULT_NAVN;
        }
        return BACKEND_PLACEHOLDERS.DEFAULT_NAVN;
    })();

    let personIdent: string | undefined = undefined;
    if (isRegisterOppslag(adresseData)) {
        personIdent = adresseData.fødselsnummer;
    }

    let organisasjonsnummer: string | undefined = undefined;
    if (isOrganisasjonsregisterOppslag(adresseData)) {
        organisasjonsnummer = adresseData.organisasjonsnummer;
    }

    return {
        type,
        navn,
        personIdent,
        organisasjonsnummer,
        vergetype: VergetypeEnum.Udefinert,
        manuellAdresseInfo: getManuellAdresseInfo(adresseData),
    };
};

export const mapBrevmottakerToFormData = (
    brevmottaker: Brevmottaker
): Partial<BrevmottakerFormData> => {
    const baseFormData: Partial<BrevmottakerFormData> = {
        mottakerType: brevmottaker.type,
    };

    const mapAdresse = (
        brevmottaker: Brevmottaker
    ): BrukerMedUtenlandskAdresseData & { postnummer: string; poststed: string } => ({
        navn: brevmottaker.navn || '',
        land: brevmottaker.manuellAdresseInfo?.landkode || '',
        adresselinje1: brevmottaker.manuellAdresseInfo?.adresselinje1 || '',
        adresselinje2: brevmottaker.manuellAdresseInfo?.adresselinje2,
        postnummer: brevmottaker.manuellAdresseInfo?.postnummer || '',
        poststed: brevmottaker.manuellAdresseInfo?.poststed || '',
    });

    const hentAdresseKilde = (
        brevmottaker: Brevmottaker
    ): Exclude<AdresseKilde, AdresseKilde.Udefinert> => {
        if (brevmottaker.manuellAdresseInfo) {
            return AdresseKilde.ManuellRegistrering;
        }
        if (brevmottaker.organisasjonsnummer) {
            return AdresseKilde.OppslagOrganisasjonsregister;
        }
        return AdresseKilde.OppslagRegister;
    };

    switch (brevmottaker.type) {
        case MottakerType.BrukerMedUtenlandskAdresse:
            return {
                ...baseFormData,
                brukerMedUtenlandskAdresse: {
                    navn: brevmottaker.navn || '',
                    land: brevmottaker.manuellAdresseInfo?.landkode || '',
                    adresselinje1: brevmottaker.manuellAdresseInfo?.adresselinje1 || '',
                    adresselinje2: brevmottaker.manuellAdresseInfo?.adresselinje2,
                },
            };

        case MottakerType.Fullmektig: {
            const adresseKilde = hentAdresseKilde(brevmottaker);
            const baseAddress = mapAdresse(brevmottaker);

            let adresseData: FullmektigData;

            if (adresseKilde === AdresseKilde.ManuellRegistrering) {
                adresseData = {
                    adresseKilde,
                    navn: baseAddress.navn,
                    land: baseAddress.land,
                    adresselinje1: baseAddress.adresselinje1 || '',
                    adresselinje2: baseAddress.adresselinje2,
                    postnummer: baseAddress.postnummer,
                    poststed: baseAddress.poststed,
                };
            } else if (adresseKilde === AdresseKilde.OppslagRegister) {
                adresseData = {
                    adresseKilde,
                    fødselsnummer: brevmottaker.personIdent || '',
                } as RegisterOppslag;
            } else {
                adresseData = {
                    adresseKilde,
                    organisasjonsnummer: brevmottaker.organisasjonsnummer || '',
                    navn: brevmottaker.navn,
                } as OrganisasjonsregisterOppslag;
            }

            return {
                ...baseFormData,
                fullmektig: adresseData,
            };
        }

        case MottakerType.Verge: {
            const adresseKilde = hentAdresseKilde(brevmottaker);
            const baseAddress = mapAdresse(brevmottaker);

            let adresseData: VergeData;

            if (adresseKilde === AdresseKilde.ManuellRegistrering) {
                adresseData = {
                    adresseKilde,
                    navn: baseAddress.navn,
                    land: baseAddress.land,
                    adresselinje1: baseAddress.adresselinje1 || '',
                    adresselinje2: baseAddress.adresselinje2,
                    postnummer: baseAddress.postnummer,
                    poststed: baseAddress.poststed,
                };
            } else if (adresseKilde === AdresseKilde.OppslagRegister) {
                adresseData = {
                    adresseKilde,
                    fødselsnummer: brevmottaker.personIdent || '',
                } as RegisterOppslag;
            } else {
                adresseData = {
                    adresseKilde: AdresseKilde.ManuellRegistrering,
                    navn: baseAddress.navn,
                    land: baseAddress.land,
                    adresselinje1: baseAddress.adresselinje1,
                    adresselinje2: baseAddress.adresselinje2,
                    postnummer: baseAddress.postnummer,
                    poststed: baseAddress.poststed,
                } as VergeData;
            }

            return {
                ...baseFormData,
                verge: adresseData,
            };
        }

        case MottakerType.Dødsbo:
            return {
                ...baseFormData,
                dødsbo: {
                    navn: brevmottaker.navn,
                    land: brevmottaker.manuellAdresseInfo?.landkode || '',
                    adresselinje1: brevmottaker.manuellAdresseInfo?.adresselinje1 || '',
                    adresselinje2: brevmottaker.manuellAdresseInfo?.adresselinje2,
                    postnummer: brevmottaker.manuellAdresseInfo?.postnummer,
                    poststed: brevmottaker.manuellAdresseInfo?.poststed,
                },
            };

        default:
            return baseFormData;
    }
};

export type BrevmottakerFormData = z.input<typeof brevmottakerFormDataSchema>;

type BrukerMedUtenlandskAdresseData = z.infer<typeof brukerMedUtenlandskAdresseSchema>;
type FullmektigData = z.infer<typeof fullmektigSchema>;
type VergeData = z.infer<typeof vergeSchema>;
type DødsboData = z.infer<typeof dødsboSchema>;

type RegisterOppslag = {
    adresseKilde: AdresseKilde.OppslagRegister;
    fødselsnummer: string;
};

type OrganisasjonsregisterOppslag = {
    adresseKilde: AdresseKilde.OppslagOrganisasjonsregister;
    organisasjonsnummer: string;
    navn?: string;
};
