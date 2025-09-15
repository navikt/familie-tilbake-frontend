import { z } from 'zod';

// Validering for norsk organisasjonsnummer (kun format-validering)
// Egentlig validering og oppslag skjer på backend ved lagring
export const organisasjonsnummerSchema = z
    .string()
    .min(1, 'Organisasjonsnummer er påkrevd')
    .length(9, 'Organisasjonsnummer må være 9 siffer')
    .regex(/^\d+$/, 'Organisasjonsnummer må kun inneholde tall');

// Validering for fødselsnummer/personnummer (11 siffer)
export const personnummerSchema = z
    .string()
    .min(1, 'Fødselsnummer er påkrevd')
    .length(11, 'Fødselsnummer må være 11 siffer')
    .regex(/^\d+$/, 'Fødselsnummer må kun inneholde tall');

// Validering for navn/kontaktperson (tilpasset brevmottaker regler)
export const navnSchema = z
    .string()
    .min(1, 'Navn på person eller organisasjon er påkrevd')
    .max(80, 'Navn kan ikke inneholde mer enn 80 tegn');

// Validering for adressefelter
export const adresseFeltSchema = z
    .string()
    .min(1, 'Feltet er påkrevd')
    .max(80, 'Feltet kan ikke inneholde mer enn 80 tegn');

export const adresseFelt2Schema = z.string().max(80, 'Feltet kan ikke inneholde mer enn 80 tegn');

// Validering for land
export const landSchema = z
    .string()
    .min(1, 'Feltet er påkrevd')
    .max(2, 'Feltet kan ikke inneholde mer enn 2 tegn');

// Validering for postnummer (kun for Norge)
export const postnummerSchema = z
    .string()
    .min(1, 'Feltet er påkrevd')
    .max(10, 'Feltet kan ikke inneholde mer enn 10 tegn');

// Validering for poststed (kun for Norge)
export const poststedSchema = z
    .string()
    .min(1, 'Feltet er påkrevd')
    .max(50, 'Feltet kan ikke inneholde mer enn 50 tegn');

// Hjelpefunksjon for å konvertere Zod-feil til react-hook-form format
export const zodValidate = <T>(schema: z.ZodSchema<T>) => {
    return (value: unknown): boolean | string => {
        const result = schema.safeParse(value);
        if (result.success) {
            return true;
        }
        return result.error.issues[0]?.message || 'Ugyldig verdi';
    };
};

// Spesifikk validering for organisasjonsnummer som kan brukes direkte i react-hook-form
export const validateOrganisasjonsnummer = (value: string | undefined): boolean | string => {
    if (!value) return true; // La required-regel håndtere tom verdi

    const result = organisasjonsnummerSchema.safeParse(value);
    if (result.success) {
        return true;
    }
    return result.error.issues[0]?.message || 'Ugyldig organisasjonsnummer';
};

// Spesifikk validering for personnummer som kan brukes direkte i react-hook-form
export const validatePersonnummer = (value: string | undefined): boolean | string => {
    if (!value) return true; // La required-regel håndtere tom verdi

    const result = personnummerSchema.safeParse(value);
    if (result.success) {
        return true;
    }
    return result.error.issues[0]?.message || 'Ugyldig fødselsnummer';
};

// Validering for manuell adresse basert på adressekilde
export const validateManuellAdresse = (
    value: string | undefined,
    adresseKilde: string,
    isRequired: boolean = true
): boolean | string => {
    if (adresseKilde === 'ManuellRegistrering' || adresseKilde === 'Udefinert') {
        if (isRequired && (!value || value.trim() === '')) {
            return 'Feltet er påkrevd';
        }
    }
    return true;
};

// Validering for postnummer og poststed basert på land
export const validatePostnummerForLand = (
    postnummer: string | undefined,
    land: string
): boolean | string => {
    if (land === 'NO' && (!postnummer || postnummer.trim() === '')) {
        return 'Feltet er påkrevd';
    }
    return true;
};

export const validatePoststedForLand = (
    poststed: string | undefined,
    land: string
): boolean | string => {
    if (land === 'NO' && (!poststed || poststed.trim() === '')) {
        return 'Feltet er påkrevd';
    }
    return true;
};

// Validering for mottakertype kombinasjoner
export const validateMottakerType = (
    selectedType: string,
    existingTypes: string[],
    mottakerTypeVisningsnavn: Record<string, string>
): boolean | string => {
    if (!selectedType) {
        return 'Feltet er påkrevd';
    }

    // Sjekk om samme type allerede eksisterer
    if (existingTypes.includes(selectedType)) {
        return `${mottakerTypeVisningsnavn[selectedType]} er allerede lagt til`;
    }

    // Dødsbo kan ikke kombineres med andre
    if (selectedType === 'Dødsbo' || existingTypes.includes('Dødsbo')) {
        return 'Dødsbo kan ikke kombineres med andre brevmottakere';
    }

    // BrukerMedUtenlandskAdresse kan kombineres med alle
    if (
        selectedType === 'BrukerMedUtenlandskAdresse' ||
        existingTypes.includes('BrukerMedUtenlandskAdresse')
    ) {
        return true;
    }

    // Andre typer kan ikke kombineres
    if (existingTypes.length > 0) {
        const existingType = existingTypes[0];
        return `${mottakerTypeVisningsnavn[existingType]} kan ikke kombineres med ${mottakerTypeVisningsnavn[
            selectedType
        ].toLowerCase()}.`;
    }

    return true;
};
