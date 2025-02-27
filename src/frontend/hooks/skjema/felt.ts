import type {
    Felt,
    FeltState,
    NavBaseSkjemaProps,
    NavInputProps,
    ValiderFelt,
    Avhengigheter,
} from './typer';
import type { ChangeEvent } from 'react';

import deepEqual from 'deep-equal';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { defaultValidator, Valideringsstatus } from './typer';
import { isChangeEvent } from './utils';

/**
 * Konfigurasjon for å opprette et felt.
 *
 * @verdi verdien til feltet med generisk Verdi type
 * @valideringsfunksjon optional valideringsfunksjon på feltet
 * @skalFeltetVises optional visningsfunksjon. Kan brukes dersom skjemaet
 * skjuler felter for bruker under gitte omstendigheter
 * @avhengigheter avhengighetene som brukes til validering og vis/skjul
 */
export interface FeltConfig<Verdi> {
    avhengigheter?: Avhengigheter;
    feltId?: string;
    skalFeltetVises?: (avhengigheter: Avhengigheter) => boolean;
    valideringsfunksjon?: ValiderFelt<Verdi>;
    verdi: Verdi;
    nullstillVedAvhengighetEndring?: boolean;
}

export const useFelt = <Verdi = string>({
    avhengigheter = {},
    feltId,
    skalFeltetVises,
    valideringsfunksjon = defaultValidator,
    verdi,
    nullstillVedAvhengighetEndring = true,
}: FeltConfig<Verdi>): Felt<Verdi> => {
    const [id] = useState(feltId ? feltId : uuidv4());
    const initialFeltState = {
        feilmelding: '',
        valider: valideringsfunksjon,
        valideringsstatus: Valideringsstatus.IKKE_VALIDERT,
        verdi,
    };

    const [feltState, settFeltState] = useState<FeltState<Verdi>>(initialFeltState);
    const [erSynlig, settErSynlig] = useState(
        skalFeltetVises ? skalFeltetVises(avhengigheter) : true
    );

    const nullstill = () => {
        settFeltState(initialFeltState);
    };

    // tslint:disable-next-line:no-shadowed-variable
    const validerOgSettFelt = (verdi: Verdi = feltState.verdi): FeltState<Verdi> => {
        const validertFelt: FeltState<Verdi> = feltState.valider(
            {
                ...feltState,
                verdi,
            },
            avhengigheter
        );

        if (!deepEqual(feltState, validertFelt)) {
            settFeltState(validertFelt);
        }

        return validertFelt;
    };

    const hentAvhengighetArray = () => {
        return avhengigheter
            ? Object.values(avhengigheter).reduce((acc: [], avhengighet: unknown) => {
                  if (avhengighet instanceof Object && 'valideringsstatus' in avhengighet) {
                      return [...acc, (avhengighet as Felt<unknown>).verdi];
                  } else {
                      return [...acc, avhengighet];
                  }
              }, [])
            : [];
    };

    /**
     * Basert på avhengighetene til feltet håndterer vi vis/skjul
     * og nullstilling på feltet.
     */
    useEffect(() => {
        if (skalFeltetVises) {
            if (
                nullstillVedAvhengighetEndring &&
                feltState.valideringsstatus !== Valideringsstatus.IKKE_VALIDERT
            ) {
                nullstill();
            }

            settErSynlig(skalFeltetVises(avhengigheter));
        } else {
            validerOgSettFelt();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...hentAvhengighetArray()]);

    const onChange = useCallback(
        // tslint:disable-next-line:no-shadowed-variable
        (verdi: ChangeEvent | Verdi) => {
            const normalisertVerdi = isChangeEvent(verdi) ? verdi.target.value : verdi;

            validerOgSettFelt(normalisertVerdi as Verdi);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [validerOgSettFelt, settFeltState]
    );

    const hentNavInputProps = useCallback(
        (visFeilmelding: boolean): NavInputProps<Verdi> => ({
            feil: visFeilmelding ? feltState.feilmelding : undefined,
            error: visFeilmelding ? feltState.feilmelding : undefined,
            id,
            onChange,
            value: feltState.verdi,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [validerOgSettFelt, settFeltState]
    );

    const hentNavBaseSkjemaProps = useCallback(
        (visFeilmelding: boolean): NavBaseSkjemaProps<Verdi> => ({
            feil: visFeilmelding ? feltState.feilmelding : undefined,
            error: visFeilmelding ? feltState.feilmelding : undefined,
            id,
            value: feltState.verdi,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [validerOgSettFelt, settFeltState]
    );

    return useMemo(
        () => ({
            ...feltState,
            id,
            hentNavInputProps,
            hentNavBaseSkjemaProps,
            nullstill,
            erSynlig,
            onChange,
            validerOgSettFelt,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [feltState, hentNavInputProps, validerOgSettFelt, nullstill, onChange]
    );
};
