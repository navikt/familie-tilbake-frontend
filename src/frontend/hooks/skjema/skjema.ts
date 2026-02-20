import type {
    FeiloppsummeringFeil,
    Felt,
    FeltState,
    FieldDictionary,
    Skjema,
    UseSkjemaVerdi,
} from './typer';
import type { FamilieRequestConfig } from '@api/http/HttpProvider';

import { useHttp } from '@api/http/HttpProvider';
import { byggHenterRessurs, byggTomRessurs, type Ressurs, RessursStatus } from '@typer/ressurs';
import { useState } from 'react';

import { Valideringsstatus } from './typer';

export const useSkjema = <Felter, SkjemaRespons>({
    felter,
    skjemanavn,
}: {
    felter: FieldDictionary<Felter>;
    skjemanavn: string;
}): UseSkjemaVerdi<Felter, SkjemaRespons> => {
    const { request } = useHttp();
    const [visFeilmeldinger, settVisfeilmeldinger] = useState(false);
    const [submitRessurs, settSubmitRessurs] = useState(byggTomRessurs<SkjemaRespons>());

    const alleSynligeFelter = (): unknown[] => {
        return Object.values(felter).filter(felt => (felt as Felt<unknown>).erSynlig);
    };

    const validerAlleSynligeFelter = (): FeltState<unknown>[] => {
        const synligeFelter: Felt<unknown>[] = alleSynligeFelter().map(
            felt => felt as Felt<unknown>
        );

        return [
            ...synligeFelter
                .filter(
                    (unknownFelt: Felt<unknown>) =>
                        unknownFelt.valideringsstatus === Valideringsstatus.IkkeValidert
                )
                .map((unknownFelt: Felt<unknown>) => {
                    return unknownFelt.validerOgSettFelt(unknownFelt.verdi, {
                        felter,
                    });
                }),
            ...synligeFelter.filter(
                (unknownFelt: Felt<unknown>) =>
                    unknownFelt.valideringsstatus !== Valideringsstatus.IkkeValidert
            ),
        ];
    };

    const valideringErOk = (): boolean => {
        return (
            alleSynligeFelter().filter(felt => {
                const unknownFelt = felt as Felt<unknown>;
                return unknownFelt.valideringsstatus !== Valideringsstatus.Ok;
            }).length === 0 && skjema.submitRessurs.status !== RessursStatus.Henter
        );
    };

    const kanSendeSkjema = (): boolean => {
        const validerteSynligeFelter = validerAlleSynligeFelter();
        settVisfeilmeldinger(true);

        return (
            validerteSynligeFelter.filter(felt => {
                const unknownFelt = felt as Felt<unknown>;
                return unknownFelt.valideringsstatus !== Valideringsstatus.Ok;
            }).length === 0 && skjema.submitRessurs.status !== RessursStatus.Henter
        );
    };

    const nullstillSkjema = (): void => {
        alleSynligeFelter().forEach((felt: unknown) => (felt as Felt<unknown>).nullstill());
        settVisfeilmeldinger(false);
    };

    const onSubmit = <SkjemaData>(
        familieAxiosRequestConfig: FamilieRequestConfig<SkjemaData>,
        onSuccess: (ressurs: Ressurs<SkjemaRespons>) => void,
        onError?: (ressurs: Ressurs<SkjemaRespons>) => void
    ): void => {
        if (kanSendeSkjema()) {
            settSubmitRessurs(byggHenterRessurs());

            request<SkjemaData, SkjemaRespons>(familieAxiosRequestConfig).then(
                (response: Ressurs<SkjemaRespons>) => {
                    settSubmitRessurs(response);
                    if (response.status === RessursStatus.Suksess) {
                        nullstillSkjema();
                        onSuccess(response);
                    } else {
                        onError && onError(response);
                    }
                }
            );
        }
    };

    const hentFeilTilOppsummering = (): FeiloppsummeringFeil[] => {
        return Object.values(alleSynligeFelter())
            .filter(felt => (felt as Felt<unknown>).valideringsstatus === Valideringsstatus.Feil)
            .map(felt => {
                const typetFelt = felt as Felt<unknown>;

                return {
                    skjemaelementId: typetFelt.id,
                    feilmelding:
                        typeof typetFelt.feilmelding === 'string' ? typetFelt.feilmelding : '',
                };
            });
    };

    const skjema: Skjema<Felter, SkjemaRespons> = {
        felter,
        visFeilmeldinger,
        skjemanavn,
        submitRessurs,
    };

    return {
        hentFeilTilOppsummering,
        kanSendeSkjema,
        nullstillSkjema,
        onSubmit,
        settSubmitRessurs,
        settVisfeilmeldinger,
        skjema,
        validerAlleSynligeFelter,
        valideringErOk,
    };
};
