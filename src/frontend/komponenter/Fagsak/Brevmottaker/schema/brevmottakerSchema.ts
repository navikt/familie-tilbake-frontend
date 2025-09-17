import type { IBrevmottaker } from '../../../../typer/Brevmottaker';

import { z } from 'zod';

import { Vergetype as VergetypeEnum } from '../../../../kodeverk/verge';
import { AdresseKilde, MottakerType } from '../../../../typer/Brevmottaker';
import { isNumeric } from '../../../../utils';

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

const manuellAdresseSchema = adresseFelterSchema.extend({
    adresseKilde: z.literal(AdresseKilde.ManuellRegistrering),
    postnummer: z
        .string()
        .min(4, { message: 'Postnummer må ha 4 siffer' })
        .max(4, { message: 'Postnummer må ha 4 siffer' }),
    poststed: z.string(),
});

const registerOppslagSchema = z.object({
    adresseKilde: z.literal(AdresseKilde.OppslagRegister),
    personnummer: z.string().min(1, 'Fødselsnummer er påkrevd').pipe(fødselsnummerSchema),
});

const organisasjonsregisterOppslagSchema = z.object({
    adresseKilde: z.literal(AdresseKilde.OppslagOrganisasjonsregister),
    organisasjonsnummer: z
        .string()
        .min(1, 'Organisasjonsnummer er påkrevd')
        .pipe(organisasjonsnummerSchema),
    navn: z.string().max(80, 'Navn kan ikke inneholde mer enn 80 tegn').optional(),
});

const adresseKildeSchema = z.discriminatedUnion('adresseKilde', [
    manuellAdresseSchema,
    registerOppslagSchema,
    organisasjonsregisterOppslagSchema,
]);

export const brevmottakerFormDataInputSchema = z.object({
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
});

export const brevmottakerFormDataSchema = brevmottakerFormDataInputSchema.transform(
    (data): IBrevmottaker => {
        switch (data.mottakerType) {
            case MottakerType.Fullmektig:
                if (!data.fullmektig) {
                    throw new Error('Fullmektig data is missing');
                }
                return mapUtvideteAdresseToBrevmottaker(data.fullmektig, MottakerType.Fullmektig);

            case MottakerType.Verge:
                if (!data.verge) {
                    throw new Error('Verge data is missing');
                }
                return mapUtvideteAdresseToBrevmottaker(data.verge, MottakerType.Verge);

            case MottakerType.BrukerMedUtenlandskAdresse:
                if (!data.brukerMedUtenlandskAdresse) {
                    throw new Error('Bruker med utenlandsk adresse data is missing');
                }
                return mapAdresseFelterToBrevmottaker(
                    data.brukerMedUtenlandskAdresse,
                    MottakerType.BrukerMedUtenlandskAdresse
                );

            case MottakerType.Dødsbo:
                if (!data.dødsbo) {
                    throw new Error('Dødsbo data is missing');
                }
                return mapUtvideteAdresseToBrevmottaker(data.dødsbo, MottakerType.Dødsbo);

            case MottakerType.Bruker:
                return {
                    type: MottakerType.Bruker,
                    navn: '',
                    personIdent: undefined,
                    organisasjonsnummer: undefined,
                    vergetype: VergetypeEnum.Udefinert,
                    manuellAdresseInfo: undefined,
                };

            default:
                throw new Error(`Unsupported mottaker type: ${data.mottakerType}`);
        }
    }
);

const mapUtvideteAdresseToBrevmottaker = (
    data: z.infer<typeof adresseKildeSchema>,
    type: MottakerType.Dødsbo | MottakerType.Fullmektig | MottakerType.Verge
): IBrevmottaker => {
    switch (data.adresseKilde) {
        case AdresseKilde.ManuellRegistrering:
            return {
                type,
                navn: data.navn,
                personIdent: undefined,
                organisasjonsnummer: undefined,
                vergetype: VergetypeEnum.Udefinert,
                manuellAdresseInfo: {
                    adresselinje1: data.adresselinje1,
                    adresselinje2: data.adresselinje2 || undefined,
                    postnummer: data.postnummer.toString(),
                    poststed: data.poststed,
                    landkode: data.land,
                },
            };

        case AdresseKilde.OppslagRegister:
            return {
                type,
                navn: '',
                personIdent: data.personnummer,
                organisasjonsnummer: undefined,
                vergetype: VergetypeEnum.Udefinert,
                manuellAdresseInfo: undefined,
            };

        case AdresseKilde.OppslagOrganisasjonsregister:
            return {
                type,
                navn: data.navn || '',
                personIdent: undefined,
                organisasjonsnummer: data.organisasjonsnummer,
                vergetype: VergetypeEnum.Udefinert,
                manuellAdresseInfo: undefined,
            };
    }
};

const mapAdresseFelterToBrevmottaker = (
    data: z.infer<typeof adresseFelterSchema>,
    type: MottakerType.BrukerMedUtenlandskAdresse
): IBrevmottaker => ({
    type,
    navn: data.navn,
    personIdent: undefined,
    organisasjonsnummer: undefined,
    vergetype: VergetypeEnum.Udefinert,
    manuellAdresseInfo: {
        adresselinje1: data.adresselinje1,
        adresselinje2: data.adresselinje2 || undefined,
        postnummer: '',
        poststed: '',
        landkode: data.land,
    },
});

export const createFormDefaults = (
    initialData?: Partial<BrevmottakerFormData>
): BrevmottakerFormData => {
    const mottakerType = initialData?.mottakerType || MottakerType.BrukerMedUtenlandskAdresse;

    return {
        mottakerType,
        brukerMedUtenlandskAdresse:
            mottakerType === MottakerType.BrukerMedUtenlandskAdresse
                ? {
                      navn: initialData?.brukerMedUtenlandskAdresse?.navn || '',
                      land: initialData?.brukerMedUtenlandskAdresse?.land || '',
                      adresselinje1: initialData?.brukerMedUtenlandskAdresse?.adresselinje1 || '',
                      adresselinje2: initialData?.brukerMedUtenlandskAdresse?.adresselinje2 || '',
                  }
                : undefined,
        fullmektig: initialData?.fullmektig as AdresseRegistreringsData | undefined,
        verge: initialData?.verge as AdresseRegistreringsData | undefined,
        dødsbo: initialData?.dødsbo
            ? {
                  adresseKilde: AdresseKilde.ManuellRegistrering,
                  navn: initialData.dødsbo.navn || '',
                  land: initialData.dødsbo.land || '',
                  adresselinje1: initialData.dødsbo.adresselinje1 || '',
                  adresselinje2: initialData.dødsbo.adresselinje2 || '',
                  postnummer: initialData.dødsbo.postnummer || '',
                  poststed: initialData.dødsbo.poststed || '',
              }
            : undefined,
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
    ): {
        navn: string;
        land: string;
        adresselinje1: string;
        adresselinje2: string;
        postnummer: string;
        poststed: string;
    } => ({
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
                    adresselinje2: baseAddress.adresselinje2 || undefined,
                    postnummer: baseAddress.postnummer,
                    poststed: baseAddress.poststed,
                } as ManuellAdresse;
            } else if (adresseKilde === AdresseKilde.OppslagRegister) {
                adresseData = {
                    adresseKilde,
                    personnummer: brevmottaker.personIdent || '',
                } as RegisterOppslag;
            } else {
                adresseData = {
                    adresseKilde,
                    organisasjonsnummer: brevmottaker.organisasjonsnummer || '',
                    navn: brevmottaker.navn || '',
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
                    navn: brevmottaker.navn || '',
                    land: brevmottaker.manuellAdresseInfo?.landkode || '',
                    adresselinje1: brevmottaker.manuellAdresseInfo?.adresselinje1 || '',
                    adresselinje2: brevmottaker.manuellAdresseInfo?.adresselinje2 || '',
                    postnummer: brevmottaker.manuellAdresseInfo?.postnummer || '',
                    poststed: brevmottaker.manuellAdresseInfo?.poststed || '',
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
