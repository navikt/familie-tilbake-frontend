import type { IBrevmottaker } from '../../../../typer/Brevmottaker';

import { z } from 'zod';

import { Vergetype as VergetypeEnum } from '../../../../kodeverk/verge';
import { AdresseKilde, MottakerType } from '../../../../typer/Brevmottaker';
import { isNumeric } from '../../../../utils';

const BACKEND_PLACEHOLDERS = {
    DEFAULT_NAVN: ' ',
} as const;

const fødselsnummerSchema = z
    .string()
    .refine(val => !val || (val.length === 11 && isNumeric(val)), {
        message: 'Fødselsnummer må være 11 sammenhengende siffer',
    });

const organisasjonsnummerSchema = z
    .string()
    .refine(val => !val || (val.length === 9 && isNumeric(val)), {
        message: 'Organisasjonsnummer må være 9 sammenhengende siffer',
    });

const adresseFelterSchema = z.object({
    navn: z
        .string()
        .min(1, 'Navn på person eller organisasjon er påkrevd')
        .max(80, 'Navn kan ikke inneholde mer enn 80 tegn'),
    land: z.string().min(1, 'Land er påkrevd'),
    adresselinje1: z
        .string()
        .min(1, 'Adresselinje 1 er påkrevd')
        .max(80, 'Adresselinje 1 kan ikke inneholde mer enn 80 tegn'),
    adresselinje2: z
        .string()
        .max(80, 'Adresselinje 2 kan ikke inneholde mer enn 80 tegn')
        .optional(),
});

const manuellAdresseSchema = adresseFelterSchema
    .extend({
        adresseKilde: z.literal(AdresseKilde.ManuellRegistrering),
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

const registerOppslagSchema = z.object({
    adresseKilde: z.literal(AdresseKilde.OppslagRegister),
    fødselsnummer: z.string().min(1, 'Fødselsnummer er påkrevd').pipe(fødselsnummerSchema),
});

const organisasjonsregisterOppslagSchema = z.object({
    adresseKilde: z.literal(AdresseKilde.OppslagOrganisasjonsregister),
    organisasjonsnummer: organisasjonsnummerSchema,
    navn: z.string().max(80, 'Navn kan ikke inneholde mer enn 80 tegn').optional(),
});

const adresseKildeSchema = z.discriminatedUnion('adresseKilde', [
    manuellAdresseSchema,
    registerOppslagSchema,
    organisasjonsregisterOppslagSchema,
]);

export const brevmottakerFormDataInputSchema = z
    .object({
        mottakerType: z.enum([
            MottakerType.BrukerMedUtenlandskAdresse,
            MottakerType.Fullmektig,
            MottakerType.Verge,
            MottakerType.Dødsbo,
            MottakerType.Bruker,
        ]),
        brukerMedUtenlandskAdresse: adresseFelterSchema.optional(),
        fullmektig: adresseKildeSchema.optional(),
        verge: adresseKildeSchema.optional(),
        dødsbo: manuellAdresseSchema.optional(),
    })
    .refine(
        data => {
            switch (data.mottakerType) {
                case MottakerType.BrukerMedUtenlandskAdresse:
                    return data.brukerMedUtenlandskAdresse !== undefined;
                case MottakerType.Fullmektig:
                    return data.fullmektig !== undefined;
                case MottakerType.Verge:
                    return data.verge !== undefined;
                case MottakerType.Dødsbo:
                    return data.dødsbo !== undefined;
                case MottakerType.Bruker:
                    return true;
                default:
                    return false;
            }
        },
        {
            message: 'Påkrevde data mangler for valgt mottakertype',
        }
    );

export const brevmottakerFormDataSchema = brevmottakerFormDataInputSchema.transform(
    (data): IBrevmottaker => {
        return mapFormDataToBrevmottaker(data, data.mottakerType);
    }
);

type AdresseDataUnion = AdresseFelter | AdresseRegistreringsData | null | undefined;

const withNullCheck =
    <T extends NonNullable<AdresseDataUnion>>(
        predicate: (data: NonNullable<AdresseDataUnion>) => data is T
    ) =>
    (data: AdresseDataUnion): data is T => {
        return data != null && predicate(data);
    };

const isAdresseFelter = withNullCheck<AdresseFelter>(
    (data): data is AdresseFelter => 'land' in data && !('adresseKilde' in data)
);

const isManuellAdresse = withNullCheck<ManuellAdresse>(
    (data): data is ManuellAdresse =>
        'adresseKilde' in data && data.adresseKilde === AdresseKilde.ManuellRegistrering
);

const isRegisterOppslag = withNullCheck<RegisterOppslag>(
    (data): data is RegisterOppslag =>
        'adresseKilde' in data && data.adresseKilde === AdresseKilde.OppslagRegister
);

const isOrganisasjonsregisterOppslag = withNullCheck<OrganisasjonsregisterOppslag>(
    (data): data is OrganisasjonsregisterOppslag =>
        'adresseKilde' in data && data.adresseKilde === AdresseKilde.OppslagOrganisasjonsregister
);

const getManuellAdresseInfo = (
    adresseData: AdresseDataUnion
): IBrevmottaker['manuellAdresseInfo'] => {
    if (isAdresseFelter(adresseData)) {
        return {
            adresselinje1: (adresseData as AdresseFelter).adresselinje1,
            adresselinje2: (adresseData as AdresseFelter).adresselinje2,
            postnummer: '',
            poststed: '',
            landkode: (adresseData as AdresseFelter).land,
        };
    }
    if (isManuellAdresse(adresseData)) {
        const manuell = adresseData as ManuellAdresse;
        return {
            adresselinje1: manuell.adresselinje1,
            adresselinje2: manuell.adresselinje2,
            postnummer: manuell.postnummer ?? '',
            poststed: manuell.poststed ?? '',
            landkode: manuell.land,
        };
    }
    return undefined;
};

const flattenFormData = (
    data: z.infer<typeof brevmottakerFormDataInputSchema>
): {
    type: MottakerType;
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
    type: MottakerType
): IBrevmottaker => {
    const { adresseData } = flattenFormData(data);

    const navn = ((): string => {
        if (isAdresseFelter(adresseData) || isManuellAdresse(adresseData)) {
            return adresseData.navn;
        }
        if (isOrganisasjonsregisterOppslag(adresseData)) {
            return adresseData.navn ?? BACKEND_PLACEHOLDERS.DEFAULT_NAVN;
        }
        return BACKEND_PLACEHOLDERS.DEFAULT_NAVN;
    })();

    const personIdent = isRegisterOppslag(adresseData) ? adresseData.fødselsnummer : undefined;

    const organisasjonsnummer = isOrganisasjonsregisterOppslag(adresseData)
        ? adresseData.organisasjonsnummer
        : undefined;

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
    brevmottaker: IBrevmottaker
): Partial<BrevmottakerFormData> => {
    const baseFormData: Partial<BrevmottakerFormData> = {
        mottakerType: brevmottaker.type,
    };

    const mapAdresse = (
        brevmottaker: IBrevmottaker
    ): AdresseFelter & { postnummer: string; poststed: string } => ({
        navn: brevmottaker.navn || '',
        land: brevmottaker.manuellAdresseInfo?.landkode || '',
        adresselinje1: brevmottaker.manuellAdresseInfo?.adresselinje1 || '',
        adresselinje2: brevmottaker.manuellAdresseInfo?.adresselinje2 || '',
        postnummer: brevmottaker.manuellAdresseInfo?.postnummer || '',
        poststed: brevmottaker.manuellAdresseInfo?.poststed || '',
    });

    const hentAdresseKilde = (
        brevmottaker: IBrevmottaker
    ):
        | AdresseKilde.ManuellRegistrering
        | AdresseKilde.OppslagOrganisasjonsregister
        | AdresseKilde.OppslagRegister => {
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
                    adresselinje2: brevmottaker.manuellAdresseInfo?.adresselinje2 || '',
                },
            };

        case MottakerType.Fullmektig:
        case MottakerType.Verge: {
            const adresseKilde = hentAdresseKilde(brevmottaker);
            const baseAddress = mapAdresse(brevmottaker);

            let adresseData: AdresseRegistreringsData;

            if (adresseKilde === AdresseKilde.ManuellRegistrering) {
                adresseData = {
                    adresseKilde,
                    navn: baseAddress.navn,
                    land: baseAddress.land,
                    adresselinje1: baseAddress.adresselinje1,
                    adresselinje2: baseAddress.adresselinje2,
                    postnummer: baseAddress.postnummer,
                    poststed: baseAddress.poststed,
                } as ManuellAdresse;
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
                ...(brevmottaker.type === MottakerType.Fullmektig
                    ? { fullmektig: adresseData }
                    : { verge: adresseData }),
            };
        }

        case MottakerType.Dødsbo:
            return {
                ...baseFormData,
                dødsbo: {
                    adresseKilde: AdresseKilde.ManuellRegistrering,
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

export type BrevmottakerApiData = z.output<typeof brevmottakerFormDataSchema>;

export type AdresseRegistreringsData = z.infer<typeof adresseKildeSchema>;

export type ManuellAdresse = z.infer<typeof manuellAdresseSchema>;
export type RegisterOppslag = z.infer<typeof registerOppslagSchema>;
export type OrganisasjonsregisterOppslag = z.infer<typeof organisasjonsregisterOppslagSchema>;
export type AdresseFelter = z.infer<typeof adresseFelterSchema>;
