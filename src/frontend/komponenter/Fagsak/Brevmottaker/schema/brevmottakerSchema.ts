import type { IBrevmottaker } from '../../../../typer/Brevmottaker';

import { z } from 'zod';

import { Vergetype as VergetypeEnum } from '../../../../kodeverk/verge';
import { AdresseKilde, MottakerType } from '../../../../typer/Brevmottaker';

const flexibleGrunnleggendeAdresseFelterSchema = z.object({
    navn: z.string().optional(),
    land: z.string().optional(),
    adresselinje1: z.string().optional(),
    adresselinje2: z.string().optional(),
    postnummer: z.string().optional(),
    poststed: z.string().optional(),
});

const flexibleManuellAdresseSchema = z.object({
    adresseKilde: z.literal(AdresseKilde.ManuellRegistrering),
    navn: z.string().optional(),
    land: z.string().optional(),
    adresselinje1: z.string().optional(),
    adresselinje2: z.string().optional(),
    postnummer: z.string().optional(),
    poststed: z.string().optional(),
    personnummer: z.string().optional(),
    organisasjonsnummer: z.string().optional(),
});

const flexibleRegisterOppslagSchema = z.object({
    adresseKilde: z.literal(AdresseKilde.OppslagRegister),
    personnummer: z.string().optional(),
    organisasjonsnummer: z.string().optional(),
    navn: z.string().optional(),
    land: z.string().optional(),
    adresselinje1: z.string().optional(),
    adresselinje2: z.string().optional(),
    postnummer: z.string().optional(),
    poststed: z.string().optional(),
});

const flexibleOrganisasjonsregisterOppslagSchema = z.object({
    adresseKilde: z.literal(AdresseKilde.OppslagOrganisasjonsregister),
    personnummer: z.string().optional(),
    organisasjonsnummer: z.string().optional(),
    navn: z.string().optional(),
    land: z.string().optional(),
    adresselinje1: z.string().optional(),
    adresselinje2: z.string().optional(),
    postnummer: z.string().optional(),
    poststed: z.string().optional(),
});

const utvideteAdresseFelterSchema = z.discriminatedUnion('adresseKilde', [
    flexibleManuellAdresseSchema,
    flexibleRegisterOppslagSchema,
    flexibleOrganisasjonsregisterOppslagSchema,
]);

const mapUtvideteAdresseToBrevmottaker = (
    data: z.infer<typeof utvideteAdresseFelterSchema>,
    type: MottakerType.Fullmektig | MottakerType.Verge
): IBrevmottaker => {
    const skalHaManuellAdresse = data.adresseKilde === AdresseKilde.ManuellRegistrering;

    return {
        type,
        navn: data.navn || ' ',
        personIdent: data.personnummer || undefined,
        organisasjonsnummer: data.organisasjonsnummer || undefined,
        vergetype: VergetypeEnum.Udefinert,
        manuellAdresseInfo:
            skalHaManuellAdresse &&
            data.adresselinje1 &&
            data.postnummer &&
            data.poststed &&
            data.land
                ? {
                      adresselinje1: data.adresselinje1,
                      adresselinje2: data.adresselinje2 || undefined,
                      postnummer: data.postnummer,
                      poststed: data.poststed,
                      landkode: data.land,
                  }
                : undefined,
    };
};

const mapGrunnleggendeAdresseToBrevmottaker = (
    data: z.infer<typeof flexibleGrunnleggendeAdresseFelterSchema>,
    type: MottakerType.BrukerMedUtenlandskAdresse | MottakerType.Dødsbo
): IBrevmottaker => ({
    type,
    navn: data.navn || '',
    personIdent: undefined,
    organisasjonsnummer: undefined,
    vergetype: VergetypeEnum.Udefinert,
    manuellAdresseInfo:
        data.adresselinje1 && data.postnummer && data.poststed && data.land
            ? {
                  adresselinje1: data.adresselinje1,
                  adresselinje2: data.adresselinje2 || undefined,
                  postnummer: data.postnummer,
                  poststed: data.poststed,
                  landkode: data.land,
              }
            : undefined,
});

export const brevmottakerFormDataInputSchema = z.object({
    mottakerType: z.enum([
        MottakerType.BrukerMedUtenlandskAdresse,
        MottakerType.Fullmektig,
        MottakerType.Verge,
        MottakerType.Dødsbo,
        MottakerType.Bruker,
    ]),
    brukerMedUtenlandskAdresse: flexibleGrunnleggendeAdresseFelterSchema.optional(),
    fullmektig: utvideteAdresseFelterSchema.optional(),
    verge: utvideteAdresseFelterSchema.optional(),
    dødsbo: flexibleGrunnleggendeAdresseFelterSchema.optional(),
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
                return mapGrunnleggendeAdresseToBrevmottaker(
                    data.brukerMedUtenlandskAdresse,
                    MottakerType.BrukerMedUtenlandskAdresse
                );

            case MottakerType.Dødsbo:
                if (!data.dødsbo) {
                    throw new Error('Dødsbo data is missing');
                }
                return mapGrunnleggendeAdresseToBrevmottaker(data.dødsbo, MottakerType.Dødsbo);

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
                      postnummer: initialData?.brukerMedUtenlandskAdresse?.postnummer || '',
                      poststed: initialData?.brukerMedUtenlandskAdresse?.poststed || '',
                  }
                : undefined,
        fullmektig: initialData?.fullmektig
            ? {
                  ...initialData.fullmektig,
                  adresseKilde:
                      initialData.fullmektig.adresseKilde || AdresseKilde.ManuellRegistrering,
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
    };
};

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

export type GrunnleggendeAdresseFelter = z.infer<typeof flexibleGrunnleggendeAdresseFelterSchema>;
export type UtvideteAdresseFelter = z.infer<typeof utvideteAdresseFelterSchema>;

export type ManuellAdresse = z.infer<typeof flexibleManuellAdresseSchema>;
export type RegisterOppslag = z.infer<typeof flexibleRegisterOppslagSchema>;
export type OrganisasjonsregisterOppslag = z.infer<
    typeof flexibleOrganisasjonsregisterOppslagSchema
>;
