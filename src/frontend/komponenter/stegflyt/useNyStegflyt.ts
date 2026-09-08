import { useBehandling } from '@/context/BehandlingContext';
import { ToggleName, useToggle } from '@/context/TogglesContext';

/**
 * Den nye stegflyten ligger i action-baren og gjelder kun ny modell. Den er bak
 * feature toggle, slik at vi kan falle tilbake til den frittstående stegflyten over
 * behandlingscontaineren hvis den ikke fungerer som forventet.
 */
export const useNyStegflyt = (): boolean => {
    const { erNyModell } = useBehandling();
    const nyStegflytErPåskrudd = useToggle(ToggleName.NyStegflyt);

    return erNyModell && nyStegflytErPåskrudd;
};
