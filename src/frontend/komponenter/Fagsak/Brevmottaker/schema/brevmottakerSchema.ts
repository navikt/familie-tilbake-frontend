import type { IBrevmottaker } from '../../../../typer/Brevmottaker';

import { z } from 'zod';

import { Vergetype as VergetypeEnum } from '../../../../kodeverk/verge';
import { AdresseKilde, MottakerType } from '../../../../typer/Brevmottaker';
import {
    navnSchema,
    landSchema,
    adresseFeltSchema,
    adresseFelt2Schema,
    postnummerSchema,
    poststedSchema,
    personnummerSchema,
    organisasjonsnummerSchema,
} from '../../../../utils/validation';

// Valgfri navn-validering som ikke krever innhold
const valgfrittNavnSchema = z
    .string()
    .max(80, 'Navn kan ikke inneholde mer enn 80 tegn')
    .transform(val => (val === '' ? undefined : val))
    .optional();

// Valgfritt personnummer som håndterer tomme strenger
const valgfrittPersonnummerSchema = z
    .string()
    .transform(val => (val === '' ? undefined : val))
    .optional();

// Valgfritt organisasjonsnummer som håndterer tomme strenger
const valgfrittOrganisasjonsnummerSchema = z
    .string()
    .transform(val => (val === '' ? undefined : val))
    .optional();

// Valgfrie adressefelter som håndterer tomme strenger
const valgfrittPostnummerSchema = z
    .string()
    .transform(val => (val === '' ? undefined : val))
    .optional();

const valgfrittPoststedSchema = z
    .string()
    .transform(val => (val === '' ? undefined : val))
    .optional();

const grunnleggendeAdresseFelterSchema = z.object({
    navn: navnSchema,
    land: landSchema,
    adresselinje1: adresseFeltSchema,
    adresselinje2: adresseFelt2Schema.optional(),
    postnummer: postnummerSchema,
    poststed: poststedSchema,
});

const manuellAdresseSchema = grunnleggendeAdresseFelterSchema.extend({
    adresseKilde: z.literal(AdresseKilde.ManuellRegistrering),
});

const registerOppslagSchema = z.object({
    adresseKilde: z.literal(AdresseKilde.OppslagRegister),
    personnummer: personnummerSchema,
    organisasjonsnummer: valgfrittOrganisasjonsnummerSchema,
    navn: valgfrittNavnSchema,
    land: landSchema.optional(),
    adresselinje1: adresseFeltSchema.optional(),
    adresselinje2: adresseFelt2Schema.optional(),
    postnummer: valgfrittPostnummerSchema,
    poststed: valgfrittPoststedSchema,
});

const organisasjonsregisterOppslagSchema = z.object({
    adresseKilde: z.literal(AdresseKilde.OppslagOrganisasjonsregister),
    personnummer: valgfrittPersonnummerSchema,
    organisasjonsnummer: organisasjonsnummerSchema,
    navn: valgfrittNavnSchema,
    land: landSchema.optional(),
    adresselinje1: adresseFeltSchema.optional(),
    adresselinje2: adresseFelt2Schema.optional(),
    postnummer: valgfrittPostnummerSchema,
    poststed: valgfrittPoststedSchema,
});

const utvideteAdresseFelterSchema = z.discriminatedUnion('adresseKilde', [
    manuellAdresseSchema.extend({
        personnummer: valgfrittPersonnummerSchema,
        organisasjonsnummer: valgfrittOrganisasjonsnummerSchema,
    }),
    registerOppslagSchema,
    organisasjonsregisterOppslagSchema,
]);

const vergeManuellAdresseSchema = manuellAdresseSchema.extend({
    vergetype: z.string().min(1, 'Vergetype er påkrevd'),
    personnummer: personnummerSchema.optional(),
    organisasjonsnummer: organisasjonsnummerSchema.optional(),
});

const vergeRegisterOppslagSchema = registerOppslagSchema.extend({
    vergetype: z.string().min(1, 'Vergetype er påkrevd'),
});

const vergeOrganisasjonsregisterOppslagSchema = organisasjonsregisterOppslagSchema.extend({
    vergetype: z.string().min(1, 'Vergetype er påkrevd'),
});

const vergeFelterSchema = z.discriminatedUnion('adresseKilde', [
    vergeManuellAdresseSchema,
    vergeRegisterOppslagSchema,
    vergeOrganisasjonsregisterOppslagSchema,
]);

const mapFullmektigToBrevmottaker = (
    fullmektigData: z.infer<typeof utvideteAdresseFelterSchema>
): IBrevmottaker => {
    const skalHaManuellAdresse = fullmektigData.adresseKilde === AdresseKilde.ManuellRegistrering;

    return {
        type: MottakerType.Fullmektig,
        navn: fullmektigData.navn || ' ',
        personIdent: fullmektigData.personnummer || undefined,
        organisasjonsnummer: fullmektigData.organisasjonsnummer || undefined,
        vergetype: VergetypeEnum.Udefinert,
        manuellAdresseInfo: skalHaManuellAdresse
            ? {
                  adresselinje1: fullmektigData.adresselinje1,
                  adresselinje2: fullmektigData.adresselinje2 || undefined,
                  postnummer: fullmektigData.postnummer,
                  poststed: fullmektigData.poststed,
                  landkode: fullmektigData.land,
              }
            : undefined,
    };
};

const mapVergeToBrevmottaker = (vergeData: z.infer<typeof vergeFelterSchema>): IBrevmottaker => {
    const skalHaManuellAdresse = vergeData.adresseKilde === AdresseKilde.ManuellRegistrering;

    return {
        type: MottakerType.Verge,
        navn: vergeData.navn || ' ',
        personIdent: vergeData.personnummer || undefined,
        organisasjonsnummer: vergeData.organisasjonsnummer || undefined,
        vergetype: VergetypeEnum.Udefinert,
        manuellAdresseInfo: skalHaManuellAdresse
            ? {
                  adresselinje1: vergeData.adresselinje1,
                  adresselinje2: vergeData.adresselinje2 || undefined,
                  postnummer: vergeData.postnummer,
                  poststed: vergeData.poststed,
                  landkode: vergeData.land,
              }
            : undefined,
    };
};

const mapBrukerMedUtenlandskAdresseToBrevmottaker = (
    brukerData: z.infer<typeof grunnleggendeAdresseFelterSchema>
): IBrevmottaker => ({
    type: MottakerType.BrukerMedUtenlandskAdresse,
    navn: brukerData.navn,
    personIdent: undefined,
    organisasjonsnummer: undefined,
    vergetype: VergetypeEnum.Udefinert,
    manuellAdresseInfo: {
        adresselinje1: brukerData.adresselinje1,
        adresselinje2: brukerData.adresselinje2 || undefined,
        postnummer: brukerData.postnummer,
        poststed: brukerData.poststed,
        landkode: brukerData.land,
    },
});

const mapDødsboToBrevmottaker = (
    dødsboData: z.infer<typeof grunnleggendeAdresseFelterSchema>
): IBrevmottaker => ({
    type: MottakerType.Dødsbo,
    navn: dødsboData.navn,
    personIdent: undefined,
    organisasjonsnummer: undefined,
    vergetype: VergetypeEnum.Udefinert,
    manuellAdresseInfo: {
        adresselinje1: dødsboData.adresselinje1,
        adresselinje2: dødsboData.adresselinje2 || undefined,
        postnummer: dødsboData.postnummer,
        poststed: dødsboData.poststed,
        landkode: dødsboData.land,
    },
});

export const brevmottakerFormDataInputSchema = z
    .object({
        mottakerType: z.enum([
            MottakerType.BrukerMedUtenlandskAdresse,
            MottakerType.Fullmektig,
            MottakerType.Verge,
            MottakerType.Dødsbo,
            MottakerType.Bruker,
        ]),
        brukerMedUtenlandskAdresse: grunnleggendeAdresseFelterSchema.optional(),
        fullmektig: utvideteAdresseFelterSchema.optional(),
        verge: vergeFelterSchema.optional(),
        dødsbo: grunnleggendeAdresseFelterSchema.optional(),
    })
    .refine(
        data => {
            switch (data.mottakerType) {
                case MottakerType.BrukerMedUtenlandskAdresse:
                    return !!data.brukerMedUtenlandskAdresse;
                case MottakerType.Fullmektig:
                    return !!data.fullmektig;
                case MottakerType.Verge:
                    return !!data.verge;
                case MottakerType.Dødsbo:
                    return !!data.dødsbo;
                case MottakerType.Bruker:
                    return true;
                default:
                    return false;
            }
        },
        {
            message: 'Required data for selected mottaker type is missing',
        }
    );

export const brevmottakerFormDataSchema = brevmottakerFormDataInputSchema.transform(
    (data): IBrevmottaker => {
        switch (data.mottakerType) {
            case MottakerType.Fullmektig:
                return mapFullmektigToBrevmottaker(
                    data.fullmektig as z.infer<typeof utvideteAdresseFelterSchema>
                );

            case MottakerType.Verge:
                return mapVergeToBrevmottaker(data.verge as z.infer<typeof vergeFelterSchema>);

            case MottakerType.BrukerMedUtenlandskAdresse:
                return mapBrukerMedUtenlandskAdresseToBrevmottaker(
                    data.brukerMedUtenlandskAdresse as z.infer<
                        typeof grunnleggendeAdresseFelterSchema
                    >
                );

            case MottakerType.Dødsbo:
                return mapDødsboToBrevmottaker(
                    data.dødsbo as z.infer<typeof grunnleggendeAdresseFelterSchema>
                );

            default:
                throw new Error(`Unsupported mottaker type: ${data.mottakerType}`);
        }
    }
);

export const createFormDefaults = (
    initialData?: Partial<BrevmottakerFormData>
): BrevmottakerFormData => ({
    mottakerType: initialData?.mottakerType || MottakerType.BrukerMedUtenlandskAdresse,
    brukerMedUtenlandskAdresse: initialData?.brukerMedUtenlandskAdresse
        ? {
              ...initialData.brukerMedUtenlandskAdresse,
              navn: initialData.brukerMedUtenlandskAdresse.navn || '',
              land: initialData.brukerMedUtenlandskAdresse.land || '',
              adresselinje1: initialData.brukerMedUtenlandskAdresse.adresselinje1 || '',
              adresselinje2: initialData.brukerMedUtenlandskAdresse.adresselinje2 || '',
              postnummer: initialData.brukerMedUtenlandskAdresse.postnummer || '',
              poststed: initialData.brukerMedUtenlandskAdresse.poststed || '',
          }
        : undefined,
    fullmektig: initialData?.fullmektig
        ? {
              ...initialData.fullmektig,
              adresseKilde: initialData.fullmektig.adresseKilde || AdresseKilde.ManuellRegistrering,
              personnummer: initialData.fullmektig.personnummer || '',
              organisasjonsnummer: initialData.fullmektig.organisasjonsnummer || '',
              navn: initialData.fullmektig.navn || '',
              land: initialData.fullmektig.land || '',
              adresselinje1: initialData.fullmektig.adresselinje1 || '',
              adresselinje2: initialData.fullmektig.adresselinje2 || '',
              postnummer: initialData.fullmektig.postnummer || '',
              poststed: initialData.fullmektig.poststed || '',
          }
        : undefined,
    verge: initialData?.verge
        ? {
              ...initialData.verge,
              vergetype: initialData.verge.vergetype || '',
              adresseKilde: initialData.verge.adresseKilde || AdresseKilde.ManuellRegistrering,
              personnummer: initialData.verge.personnummer || '',
              organisasjonsnummer: initialData.verge.organisasjonsnummer || '',
              navn: initialData.verge.navn || '',
              land: initialData.verge.land || '',
              adresselinje1: initialData.verge.adresselinje1 || '',
              adresselinje2: initialData.verge.adresselinje2 || '',
              postnummer: initialData.verge.postnummer || '',
              poststed: initialData.verge.poststed || '',
          }
        : undefined,
    dødsbo: initialData?.dødsbo
        ? {
              ...initialData.dødsbo,
              navn: initialData.dødsbo.navn || '',
              land: initialData.dødsbo.land || '',
              adresselinje1: initialData.dødsbo.adresselinje1 || '',
              adresselinje2: initialData.dødsbo.adresselinje2 || '',
              postnummer: initialData.dødsbo.postnummer || '',
              poststed: initialData.dødsbo.poststed || '',
          }
        : undefined,
});

export const mapBrevmottakerToFormData = (
    brevmottaker: IBrevmottaker
): Partial<BrevmottakerFormData> => {
    const baseFormData: Partial<BrevmottakerFormData> = {
        mottakerType: brevmottaker.type,
    };

    const getAdresseKilde = (
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

    switch (brevmottaker.type) {
        case MottakerType.BrukerMedUtenlandskAdresse:
            return {
                ...baseFormData,
                brukerMedUtenlandskAdresse: mapAdresse(brevmottaker),
            };

        case MottakerType.Fullmektig:
            return {
                ...baseFormData,
                fullmektig: {
                    ...mapAdresse(brevmottaker),
                    adresseKilde: getAdresseKilde(brevmottaker),
                    personnummer: brevmottaker.personIdent || '',
                    organisasjonsnummer: brevmottaker.organisasjonsnummer || '',
                },
            };

        case MottakerType.Verge:
            return {
                ...baseFormData,
                verge: {
                    ...mapAdresse(brevmottaker),
                    vergetype: '',
                    adresseKilde: getAdresseKilde(brevmottaker),
                    personnummer: brevmottaker.personIdent || '',
                    organisasjonsnummer: brevmottaker.organisasjonsnummer || '',
                },
            };

        case MottakerType.Dødsbo:
            return {
                ...baseFormData,
                dødsbo: mapAdresse(brevmottaker),
            };

        default:
            return baseFormData;
    }
};

export type BrevmottakerFormData = z.input<typeof brevmottakerFormDataSchema>;

export type BrevmottakerApiData = z.output<typeof brevmottakerFormDataSchema>;

export type GrunnleggendeAdresseFelter = z.infer<typeof grunnleggendeAdresseFelterSchema>;
export type UtvideteAdresseFelter = z.infer<typeof utvideteAdresseFelterSchema>;
export type VergeFelter = z.infer<typeof vergeFelterSchema>;

export type ManuellAdresse = z.infer<typeof manuellAdresseSchema>;
export type RegisterOppslag = z.infer<typeof registerOppslagSchema>;
export type OrganisasjonsregisterOppslag = z.infer<typeof organisasjonsregisterOppslagSchema>;
