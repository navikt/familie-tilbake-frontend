import { useBehandling } from '@/context/BehandlingContext';
import { ToggleName, useToggle } from '@/context/TogglesContext';

export const useNyStegflyt = (): boolean => {
    const { erNyModell } = useBehandling();
    const nyStegflytErPåskrudd = useToggle(ToggleName.NyStegflyt);

    return erNyModell && nyStegflytErPåskrudd;
};
