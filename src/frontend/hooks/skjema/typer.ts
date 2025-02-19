import { ChangeEvent, Dispatch, ReactNode, SetStateAction } from 'react';

import { FamilieRequestConfig } from '../../../backend/http/HttpProvider';
import { type Ressurs, RessursStatus } from '../../typer/ressurs';

export interface FeltState<Verdi> {
    feilmelding: ReactNode;
    valider: ValiderFelt<Verdi>;
    valideringsstatus: Valideringsstatus;
    verdi: Verdi;
}

export type FeltOnChange<Verdi> = (
    verdi:
        | Verdi
        | ChangeEvent<HTMLInputElement>
        | ChangeEvent<HTMLTextAreaElement>
        | ChangeEvent<HTMLSelectElement>
) => void;

export interface Felt<Verdi> {
    erSynlig: boolean;
    feilmelding: ReactNode;
    hentNavBaseSkjemaProps(visFeilmelding: boolean): NavBaseSkjemaProps<Verdi>;
    hentNavInputProps(visFeilmelding: boolean): NavInputProps<Verdi>;
    id: string;
    nullstill(): void;
    onChange: FeltOnChange<Verdi>;
    valider: ValiderFelt<Verdi>;
    validerOgSettFelt: ValiderOgSettFelt<Verdi>;
    valideringsstatus: Valideringsstatus;
    verdi: Verdi;
}

export interface NavBaseSkjemaProps<Verdi> {
    id: string;
    feil: ReactNode | undefined; // Deprecated i nytt designsystem
    error: ReactNode | undefined; // Støtte nytt designsystem
    value: Verdi;
}

export interface NavInputProps<Verdi> extends NavBaseSkjemaProps<Verdi> {
    id: string;
    onChange: FeltOnChange<Verdi>;
}

// Kopiert fra feiloppsummering, men ønsker ikke å trekke inn dette som dependency
export interface FeiloppsummeringFeil {
    /**
     * ID til skjemaelementet som feilmeldingen tilhører.
     */
    skjemaelementId: string;
    /**
     * Selve feilmeldingen.
     */
    feilmelding: string;
}

export enum Valideringsstatus {
    FEIL = 'FEIL',
    ADVARSEL = 'ADVARSEL',
    OK = 'OK',
    IKKE_VALIDERT = 'IKKE_VALIDERT',
}

// eslint-disable-next-line
export type Avhengigheter = { [key: string]: any };
export type ValiderFelt<Verdi> = (
    felt: FeltState<Verdi>,
    avhengigheter?: Avhengigheter
) => FeltState<Verdi>;

export type ValiderOgSettFelt<Verdi> = (
    verdi: Verdi,
    avhengigheter?: Avhengigheter
) => FeltState<Verdi>;

export const defaultValidator = <Verdi>(felt: FeltState<Verdi>) => ({
    ...felt,
    valideringsstatus: Valideringsstatus.OK,
});

export type FieldDictionary<Record> = {
    [Key in keyof Record]: Felt<Record[Key]>;
};

export interface ISkjema<Felter, SkjemaRespons> {
    felter: FieldDictionary<Felter>;
    submitRessurs: Ressurs<SkjemaRespons>;
    skjemanavn: string;
    visFeilmeldinger: boolean;
}

export interface UseSkjemaVerdi<Felter, SkjemaRespons> {
    hentFeilTilOppsummering: () => FeiloppsummeringFeil[];
    kanSendeSkjema: () => boolean;
    nullstillSkjema: () => void;
    onSubmit: <SkjemaData>(
        familieAxiosRequestConfig: FamilieRequestConfig<SkjemaData>,
        onSuccess: (ressurs: Ressurs<SkjemaRespons>) => void,
        onError?: ((ressurs: Ressurs<SkjemaRespons>) => void) | undefined
    ) => void;
    settSubmitRessurs: Dispatch<
        SetStateAction<
            | {
                  status: RessursStatus.IKKE_HENTET;
              }
            | {
                  status: RessursStatus.HENTER;
              }
            | {
                  frontendFeilmelding: string;
                  status: RessursStatus.IKKE_TILGANG;
              }
            | {
                  frontendFeilmelding: string;
                  status: RessursStatus.FEILET;
              }
            | {
                  frontendFeilmelding: string;
                  status: RessursStatus.FUNKSJONELL_FEIL;
              }
            | {
                  data: SkjemaRespons;
                  status: RessursStatus.SUKSESS;
              }
        >
    >;
    settVisfeilmeldinger: Dispatch<SetStateAction<boolean>>;
    skjema: ISkjema<Felter, SkjemaRespons>;
    validerAlleSynligeFelter: () => FeltState<unknown>[];
    valideringErOk: () => boolean;
}
