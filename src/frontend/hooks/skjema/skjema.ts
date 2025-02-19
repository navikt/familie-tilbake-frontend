import { useState } from 'react';

import { FamilieRequestConfig, useHttp } from '../../../backend/http/HttpProvider';
import {
    FeiloppsummeringFeil,
    Felt,
    FeltState,
    FieldDictionary,
    ISkjema,
    UseSkjemaVerdi,
    Valideringsstatus,
} from './typer';
import {
    byggHenterRessurs,
    byggTomRessurs,
    type Ressurs,
    RessursStatus,
} from '../../typer/ressurs';

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

    const alleSynligeFelter = () => {
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
                        unknownFelt.valideringsstatus === Valideringsstatus.IKKE_VALIDERT
                )
                .map((unknownFelt: Felt<unknown>) => {
                    return unknownFelt.validerOgSettFelt(unknownFelt.verdi, {
                        felter,
                    });
                }),
            ...synligeFelter.filter(
                (unknownFelt: Felt<unknown>) =>
                    unknownFelt.valideringsstatus !== Valideringsstatus.IKKE_VALIDERT
            ),
        ];
    };

    const valideringErOk = () => {
        return (
            alleSynligeFelter().filter(felt => {
                const unknownFelt = felt as Felt<unknown>;
                return unknownFelt.valideringsstatus !== Valideringsstatus.OK;
            }).length === 0 && skjema.submitRessurs.status !== RessursStatus.HENTER
        );
    };

    const kanSendeSkjema = (): boolean => {
        const validerteSynligeFelter = validerAlleSynligeFelter();
        settVisfeilmeldinger(true);

        return (
            validerteSynligeFelter.filter(felt => {
                const unknownFelt = felt as Felt<unknown>;
                return unknownFelt.valideringsstatus !== Valideringsstatus.OK;
            }).length === 0 && skjema.submitRessurs.status !== RessursStatus.HENTER
        );
    };

    const nullstillSkjema = () => {
        alleSynligeFelter().forEach((felt: unknown) => (felt as Felt<unknown>).nullstill());
        settVisfeilmeldinger(false);
    };

    const onSubmit = <SkjemaData>(
        familieAxiosRequestConfig: FamilieRequestConfig<SkjemaData>,
        onSuccess: (ressurs: Ressurs<SkjemaRespons>) => void,
        onError?: (ressurs: Ressurs<SkjemaRespons>) => void
    ) => {
        if (kanSendeSkjema()) {
            settSubmitRessurs(byggHenterRessurs());

            request<SkjemaData, SkjemaRespons>(familieAxiosRequestConfig).then(
                (response: Ressurs<SkjemaRespons>) => {
                    settSubmitRessurs(response);
                    if (response.status === RessursStatus.SUKSESS) {
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
            .filter(felt => (felt as Felt<unknown>).valideringsstatus === Valideringsstatus.FEIL)
            .map(felt => {
                const typetFelt = felt as Felt<unknown>;

                return {
                    skjemaelementId: typetFelt.id,
                    feilmelding:
                        typeof typetFelt.feilmelding === 'string' ? typetFelt.feilmelding : '',
                };
            });
    };

    const skjema: ISkjema<Felter, SkjemaRespons> = {
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
