import { z } from 'zod';

import { MottakerType, AdresseKilde } from '../../../../typer/Brevmottaker';
// Gjenbruk eksisterende validation schemas
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

// Base adresse felter
const grunnleggendeAdresseFelterSchema = z.object({
    navn: navnSchema,
    land: landSchema,
    adresselinje1: adresseFeltSchema,
    adresselinje2: adresseFelt2Schema.optional(),
    postnummer: postnummerSchema,
    poststed: poststedSchema,
});

// Utvidete adresse felter
const utvideteAdresseFelterSchema = grunnleggendeAdresseFelterSchema.extend({
    adresseKilde: z.enum([
        AdresseKilde.ManuellRegistrering,
        AdresseKilde.OppslagRegister,
        AdresseKilde.OppslagOrganisasjonsregister,
        AdresseKilde.Udefinert,
    ]),
    personnummer: personnummerSchema.optional(),
    organisasjonsnummer: organisasjonsnummerSchema.optional(),
});

// Verge felter (utvider utvidete felter med vergetype)
const vergeFelterSchema = utvideteAdresseFelterSchema.extend({
    vergetype: z.string().min(1, 'Vergetype er påkrevd'),
});

// Hovedschema for brevmottaker form data
export const brevmottakerFormDataSchema = z
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
            // Conditional validering - riktig felt må være fylt ut basert på mottakertype
            switch (data.mottakerType) {
                case MottakerType.BrukerMedUtenlandskAdresse:
                    return !!data.brukerMedUtenlandskAdresse;
                case MottakerType.Fullmektig:
                    return !!data.fullmektig;
                case MottakerType.Verge:
                    return !!data.verge;
                case MottakerType.Dødsbo:
                    return !!data.dødsbo;
                default:
                    return false;
            }
        },
        {
            message: 'Manglende data for valgt mottakertype',
            path: ['mottakerType'],
        }
    );

// Generer TypeScript typer fra Zod schema
export type BrevmottakerFormData = z.infer<typeof brevmottakerFormDataSchema>;
export type GrunnleggendeAdresseFelter = z.infer<typeof grunnleggendeAdresseFelterSchema>;
export type UtvideteAdresseFelter = z.infer<typeof utvideteAdresseFelterSchema>;

// Eksporter schema for bruk i modalene
export default brevmottakerFormDataSchema;
