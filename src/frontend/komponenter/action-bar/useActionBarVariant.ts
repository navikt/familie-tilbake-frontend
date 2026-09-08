import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import { useNyStegflyt } from '@/komponenter/stegflyt/useNyStegflyt';

/**
 * Action-baren har tre utseender:
 * - `meny`: gammel modell, med behandlingsmenyen til venstre
 * - `stegtekst`: ny modell uten ny stegflyt, med kun stegtekst og knapper
 * - `stegflyt`: ny modell med ny stegflyt, med stegene til venstre
 */
export type ActionBarVariant = 'meny' | 'stegtekst' | 'stegflyt';

export const utledActionBarVariant = (
    erNyModell: boolean,
    visStegflyt: boolean
): ActionBarVariant => {
    if (visStegflyt) {
        return 'stegflyt';
    }
    return erNyModell ? 'stegtekst' : 'meny';
};

/**
 * Uten kravgrunnlag er behandlingen ikke i gang i noe steg (den venter), og da beholder
 * vi stegteksten som forteller hvilken tilstand behandlingen er i.
 */
export const useActionBarVariant = (): ActionBarVariant => {
    const { erNyModell } = useBehandling();
    const { harKravgrunnlag } = useBehandlingState();
    const nyStegflyt = useNyStegflyt();

    return utledActionBarVariant(erNyModell, nyStegflyt && harKravgrunnlag);
};
