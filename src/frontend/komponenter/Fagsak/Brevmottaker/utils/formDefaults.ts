import type { BrevmottakerFormData } from '../schema/brevmottakerFormData';

import { MottakerType, AdresseKilde } from '../../../../typer/Brevmottaker';

const opprettStandardSkjemaverdier = (
    initialData?: Partial<BrevmottakerFormData>
): BrevmottakerFormData => ({
    mottakerType: initialData?.mottakerType || MottakerType.BrukerMedUtenlandskAdresse,
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
        adresseKilde: AdresseKilde.ManuellRegistrering,
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
        adresseKilde: AdresseKilde.ManuellRegistrering,
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
