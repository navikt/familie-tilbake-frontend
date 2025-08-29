import type { IBrevmottaker } from '../../../../typer/Brevmottaker';
import type { FormData } from '../BrevmottakerForm';

import { Vergetype as VergetypeEnum } from '../../../../kodeverk/verge';
import { MottakerType, AdresseKilde } from '../../../../typer/Brevmottaker';

export const mapFormDataToBrevmottaker = (data: FormData): IBrevmottaker => {
    const mottakerType = data.mottakerType as MottakerType;

    switch (mottakerType) {
        case MottakerType.Fullmektig: {
            const fullmektigData = data.fullmektig;
            const skalHaManuellAdresse =
                fullmektigData?.adresseKilde === AdresseKilde.ManuellRegistrering;

            return {
                type: mottakerType,
                navn: fullmektigData?.navn || ' ',
                personIdent: fullmektigData?.personnummer || undefined,
                organisasjonsnummer: fullmektigData?.organisasjonsnummer || undefined,
                vergetype: VergetypeEnum.Udefinert,
                manuellAdresseInfo:
                    skalHaManuellAdresse && fullmektigData
                        ? {
                              adresselinje1: fullmektigData.adresselinje1,
                              adresselinje2: fullmektigData.adresselinje2 || undefined,
                              postnummer: fullmektigData.postnummer,
                              poststed: fullmektigData.poststed,
                              landkode: fullmektigData.land,
                          }
                        : undefined,
            };
        }

        case MottakerType.Verge: {
            const vergeData = data.verge;
            const skalHaManuellAdresse =
                vergeData?.adresseKilde === AdresseKilde.ManuellRegistrering;

            return {
                type: mottakerType,
                navn: vergeData?.navn || ' ',
                personIdent: vergeData?.personnummer || undefined,
                organisasjonsnummer: vergeData?.organisasjonsnummer || undefined,
                vergetype: VergetypeEnum.Udefinert,
                manuellAdresseInfo:
                    skalHaManuellAdresse && vergeData
                        ? {
                              adresselinje1: vergeData.adresselinje1,
                              adresselinje2: vergeData.adresselinje2 || undefined,
                              postnummer: vergeData.postnummer,
                              poststed: vergeData.poststed,
                              landkode: vergeData.land,
                          }
                        : undefined,
            };
        }

        case MottakerType.BrukerMedUtenlandskAdresse: {
            const brukerData = data.brukerMedUtenlandskAdresse;
            return {
                type: mottakerType,
                navn: brukerData?.navn || ' ',
                manuellAdresseInfo: brukerData
                    ? {
                          adresselinje1: brukerData.adresselinje1,
                          adresselinje2: brukerData.adresselinje2 || undefined,
                          postnummer: brukerData.postnummer,
                          poststed: brukerData.poststed,
                          landkode: brukerData.land,
                      }
                    : undefined,
            };
        }

        case MottakerType.Dødsbo: {
            const dødsboData = data.dødsbo;
            return {
                type: mottakerType,
                navn: dødsboData?.navn || ' ',
                manuellAdresseInfo: dødsboData
                    ? {
                          adresselinje1: dødsboData.adresselinje1,
                          adresselinje2: dødsboData.adresselinje2 || undefined,
                          postnummer: dødsboData.postnummer,
                          poststed: dødsboData.poststed,
                          landkode: dødsboData.land,
                      }
                    : undefined,
            };
        }

        default: {
            return {
                type: mottakerType,
                navn: '',
            };
        }
    }
};

export const mapBrevmottakerToFormData = (brevmottaker: IBrevmottaker): Partial<FormData> => {
    const baseData = {
        mottakerType: brevmottaker.type,
    };

    const adresseInfo = brevmottaker.manuellAdresseInfo;

    switch (brevmottaker.type) {
        case MottakerType.Fullmektig:
            return {
                ...baseData,
                fullmektig: {
                    navn: brevmottaker.navn,
                    personnummer: brevmottaker.personIdent || '',
                    organisasjonsnummer: brevmottaker.organisasjonsnummer || '',
                    adresseKilde: AdresseKilde.ManuellRegistrering,
                    land: adresseInfo?.landkode || '',
                    adresselinje1: adresseInfo?.adresselinje1 || '',
                    adresselinje2: adresseInfo?.adresselinje2 || '',
                    postnummer: adresseInfo?.postnummer || '',
                    poststed: adresseInfo?.poststed || '',
                },
            };

        case MottakerType.Verge:
            return {
                ...baseData,
                verge: {
                    navn: brevmottaker.navn,
                    personnummer: brevmottaker.personIdent || '',
                    organisasjonsnummer: brevmottaker.organisasjonsnummer || '',
                    vergetype: brevmottaker.vergetype || '',
                    adresseKilde: AdresseKilde.ManuellRegistrering,
                    land: adresseInfo?.landkode || '',
                    adresselinje1: adresseInfo?.adresselinje1 || '',
                    adresselinje2: adresseInfo?.adresselinje2 || '',
                    postnummer: adresseInfo?.postnummer || '',
                    poststed: adresseInfo?.poststed || '',
                },
            };

        case MottakerType.BrukerMedUtenlandskAdresse:
            return {
                ...baseData,
                brukerMedUtenlandskAdresse: {
                    navn: brevmottaker.navn,
                    land: adresseInfo?.landkode || '',
                    adresselinje1: adresseInfo?.adresselinje1 || '',
                    adresselinje2: adresseInfo?.adresselinje2 || '',
                    postnummer: adresseInfo?.postnummer || '',
                    poststed: adresseInfo?.poststed || '',
                },
            };

        case MottakerType.Dødsbo:
            return {
                ...baseData,
                dødsbo: {
                    navn: brevmottaker.navn,
                    land: adresseInfo?.landkode || '',
                    adresselinje1: adresseInfo?.adresselinje1 || '',
                    adresselinje2: adresseInfo?.adresselinje2 || '',
                    postnummer: adresseInfo?.postnummer || '',
                    poststed: adresseInfo?.poststed || '',
                },
            };

        default:
            return baseData;
    }
};
