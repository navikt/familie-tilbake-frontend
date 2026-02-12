import type { Felt } from '../../../hooks/skjema';

import { DatePicker, useDatepicker } from '@navikt/ds-react';
import { addDays, format, startOfDay, subDays } from 'date-fns';
import * as React from 'react';
import { useState } from 'react';

import { dagensDato, Datoformat } from '../../../utils/dato';

type Props = {
    felt: Felt<Date | undefined>;
    label: string;
    description?: React.ReactNode;
    visFeilmeldinger: boolean;
    minDatoAvgrensning?: Date;
    maksDatoAvgrensning?: Date;
    kanKunVelgeFortid?: boolean;
    kanKunVelgeFremtid?: boolean;
    readOnly?: boolean;
    settIkkePersistertKomponent?: () => void;
};

enum Feilmelding {
    UgyldigDato = 'UGYLDIG_DATO',
    FørMinDato = 'FØR_MIN_DATO',
    EtterMaksDato = 'ETTER_MAKS_DATO',
}

const tidligsteRelevanteDato = startOfDay(new Date(1900, 0));

const senesteRelevanteDato = startOfDay(new Date(2500, 0));

export const Datovelger: React.FC<Props> = ({
    felt,
    label,
    visFeilmeldinger,
    minDatoAvgrensning,
    maksDatoAvgrensning,
    description,
    kanKunVelgeFortid = false,
    kanKunVelgeFremtid = false,
    readOnly = false,
    settIkkePersistertKomponent,
}: Props) => {
    const [error, setError] = useState<Feilmelding | undefined>(undefined);

    const hentToDate = (): Date => {
        if (maksDatoAvgrensning) return maksDatoAvgrensning;
        if (kanKunVelgeFortid) return dagensDato;
        return senesteRelevanteDato;
    };

    const hentFromDate = (): Date => {
        if (minDatoAvgrensning) return minDatoAvgrensning;
        if (kanKunVelgeFremtid) return dagensDato;
        return tidligsteRelevanteDato;
    };

    const nullstillOgSettFeilmelding = (feilmelding: Feilmelding): void => {
        if (error !== feilmelding) {
            setError(feilmelding);
            felt.nullstill();
        }
    };
    const { datepickerProps, inputProps } = useDatepicker({
        defaultSelected: felt.verdi,
        onDateChange: (dato?: Date) => {
            felt.validerOgSettFelt(dato);
            if (settIkkePersistertKomponent) {
                settIkkePersistertKomponent();
            }
        },
        fromDate: hentFromDate(),
        toDate: hentToDate(),
        onValidate: val => {
            if (val.isBefore) {
                nullstillOgSettFeilmelding(Feilmelding.FørMinDato);
            } else if (val.isAfter) {
                nullstillOgSettFeilmelding(Feilmelding.EtterMaksDato);
            } else if (!val.isValidDate) {
                nullstillOgSettFeilmelding(Feilmelding.UgyldigDato);
            } else {
                setError(undefined);
            }
        },
    });

    const feilmeldingForDatoFørMinDato = (): string => {
        if (kanKunVelgeFremtid) {
            return 'Du kan ikke sette en dato som er tilbake i tid';
        }
        const førsteUgyldigeDato = minDatoAvgrensning
            ? format(subDays(minDatoAvgrensning, 1), Datoformat.Dato)
            : '';
        return `Du må velge en dato som er senere enn ${førsteUgyldigeDato}`;
    };
    const feilmeldingForDatoEtterMaksDato = (): string => {
        if (kanKunVelgeFortid) {
            return 'Du kan ikke sette en dato som er frem i tid';
        }
        const førsteUgyldigeDato = maksDatoAvgrensning
            ? format(addDays(maksDatoAvgrensning, 1), Datoformat.Dato)
            : '';
        return `Du må velge en dato som er tidligere enn ${førsteUgyldigeDato}`;
    };

    const feilmeldinger: Record<Feilmelding, string> = {
        [Feilmelding.UgyldigDato]: 'Du må velge en gyldig dato',
        [Feilmelding.FørMinDato]: feilmeldingForDatoFørMinDato(),
        [Feilmelding.EtterMaksDato]: feilmeldingForDatoEtterMaksDato(),
    };

    return (
        <DatePicker dropdownCaption {...datepickerProps}>
            <DatePicker.Input
                {...inputProps}
                label={label}
                description={description}
                placeholder="DD.MM.ÅÅÅÅ"
                readOnly={readOnly}
                error={
                    error && visFeilmeldinger
                        ? feilmeldinger[error]
                        : felt.hentNavBaseSkjemaProps(visFeilmeldinger).error
                }
            />
        </DatePicker>
    );
};
