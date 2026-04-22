import type { Felt, FeltState, FieldDictionary, Skjema, UseSkjemaVerdi } from './typer';
import type { FamilieRequestConfig } from '~/api/http/HttpProvider';

import { useState } from 'react';

import { useHttp } from '~/api/http/HttpProvider';
import { byggHenterRessurs, byggTomRessurs, type Ressurs, RessursStatus } from '~/typer/ressurs';

import { Valideringsstatus } from './typer';

export const useSkjema = <Felter, SkjemaRespons>({
    felter,
    skjemanavn,
}: {
    felter: FieldDictionary<Felter>;
    skjemanavn: string;
}): UseSkjemaVerdi<Felter, SkjemaRespons> => {
    const { request } = useHttp();
    const [visFeilmeldinger, setVisFeilmeldinger] = useState(false);
    const tomRessurs = byggTomRessurs<SkjemaRespons>();
    const [submitRessurs, setSubmitRessurs] = useState(tomRessurs);

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

    const kanSendeSkjema = (): boolean => {
        const validerteSynligeFelter = validerAlleSynligeFelter();
        setVisFeilmeldinger(true);

        return (
            validerteSynligeFelter.filter(felt => {
                const unknownFelt = felt as Felt<unknown>;
                return unknownFelt.valideringsstatus !== Valideringsstatus.Ok;
            }).length === 0 && skjema.submitRessurs.status !== RessursStatus.Henter
        );
    };

    const nullstillSkjema = (): void => {
        alleSynligeFelter().forEach((felt: unknown) => (felt as Felt<unknown>).nullstill());
        setVisFeilmeldinger(false);
    };

    const onSubmit = <SkjemaData>(
        familieAxiosRequestConfig: FamilieRequestConfig<SkjemaData>,
        onSuccess: (ressurs: Ressurs<SkjemaRespons>) => void,
        onError?: (ressurs: Ressurs<SkjemaRespons>) => void
    ): void => {
        if (kanSendeSkjema()) {
            setSubmitRessurs(byggHenterRessurs());

            request<SkjemaData, SkjemaRespons>(familieAxiosRequestConfig).then(
                (response: Ressurs<SkjemaRespons>) => {
                    setSubmitRessurs(response);
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

    const skjema: Skjema<Felter, SkjemaRespons> = {
        felter,
        visFeilmeldinger,
        skjemanavn,
        submitRessurs,
    };

    return {
        kanSendeSkjema,
        nullstillSkjema,
        onSubmit,
        skjema,
        validerAlleSynligeFelter,
    };
};
