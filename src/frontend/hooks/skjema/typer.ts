import type { ChangeEvent, ReactNode } from 'react';
import type { FamilieRequestConfig } from '~/api/http/HttpProvider';

import { type Ressurs } from '~/typer/ressurs';

export type FeltState<Verdi> = {
    feilmelding: ReactNode;
    valider: ValiderFelt<Verdi>;
    valideringsstatus: Valideringsstatus;
    verdi: Verdi;
};

type FeltOnChange<Verdi> = (
    verdi:
        | ChangeEvent<HTMLInputElement>
        | ChangeEvent<HTMLSelectElement>
        | ChangeEvent<HTMLTextAreaElement>
        | Verdi
) => void;

export type Felt<Verdi> = {
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
};

export type NavBaseSkjemaProps<Verdi> = {
    id: string;
    feil: ReactNode | undefined; // Deprecated i nytt designsystem
    error: ReactNode | undefined; // Støtte nytt designsystem
    value: Verdi;
};

export interface NavInputProps<Verdi> extends NavBaseSkjemaProps<Verdi> {
    id: string;
    onChange: FeltOnChange<Verdi>;
}

export enum Valideringsstatus {
    Feil = 'FEIL',
    Advarsel = 'ADVARSEL',
    Ok = 'OK',
    IkkeValidert = 'IKKE_VALIDERT',
}

// eslint-disable-next-line
export type Avhengigheter = { [key: string]: any };
export type ValiderFelt<Verdi> = (
    felt: FeltState<Verdi>,
    avhengigheter?: Avhengigheter
) => FeltState<Verdi>;

type ValiderOgSettFelt<Verdi> = (verdi: Verdi, avhengigheter?: Avhengigheter) => FeltState<Verdi>;

export const defaultValidator = <Verdi>(felt: FeltState<Verdi>): FeltState<Verdi> => ({
    ...felt,
    valideringsstatus: Valideringsstatus.Ok,
});

export type FieldDictionary<Record> = {
    [Key in keyof Record]: Felt<Record[Key]>;
};

export type Skjema<Felter, SkjemaRespons> = {
    felter: FieldDictionary<Felter>;
    submitRessurs: Ressurs<SkjemaRespons>;
    skjemanavn: string;
    visFeilmeldinger: boolean;
};

export type UseSkjemaVerdi<Felter, SkjemaRespons> = {
    kanSendeSkjema: () => boolean;
    nullstillSkjema: () => void;
    onSubmit: <SkjemaData>(
        familieAxiosRequestConfig: FamilieRequestConfig<SkjemaData>,
        onSuccess: (ressurs: Ressurs<SkjemaRespons>) => void,
        onError?: ((ressurs: Ressurs<SkjemaRespons>) => void) | undefined
    ) => void;
    skjema: Skjema<Felter, SkjemaRespons>;
    validerAlleSynligeFelter: () => FeltState<unknown>[];
};
