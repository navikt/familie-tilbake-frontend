import type { FormData } from '../types/FormData';

/**
 * Standardverdier for brevmottaker-skjemaet
 */
const opprettStandardSkjemaverdier = (initialData?: Partial<FormData>): FormData => ({
    mottakerType: initialData?.mottakerType || '',
    brukerMedUtenlandskAdresse: {
        navn: '',
        land: '',
        adresselinje1: '',
        adresselinje2: '',
        postnummer: '',
        poststed: '',
        ...initialData?.brukerMedUtenlandskAdresse,
    },
    fullmektig: {
        adresseKilde: '',
        personnummer: '',
        organisasjonsnummer: '',
        navn: '',
        land: '',
        adresselinje1: '',
        adresselinje2: '',
        postnummer: '',
        poststed: '',
        ...initialData?.fullmektig,
    },
    verge: {
        vergetype: '',
        adresseKilde: '',
        personnummer: '',
        organisasjonsnummer: '',
        navn: '',
        land: '',
        adresselinje1: '',
        adresselinje2: '',
        postnummer: '',
        poststed: '',
        ...initialData?.verge,
    },
    dødsbo: {
        navn: '',
        land: '',
        adresselinje1: '',
        adresselinje2: '',
        postnummer: '',
        poststed: '',
        ...initialData?.dødsbo,
    },
});

export { opprettStandardSkjemaverdier };
