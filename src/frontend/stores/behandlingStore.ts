import type { InnloggetRolleEnum } from '@/generated';

import { create } from 'zustand';

export type BehandlingState = {
    behandlingId: string | undefined;
    rolle: InnloggetRolleEnum;
    erNyModell: boolean;
    setBehandlingId: (behandlingId: string | undefined) => void;
    setRolle: (rolle: InnloggetRolleEnum) => void;
    setErNyModell: (erNyModell: boolean) => void;
};

export const useBehandlingStore = create<BehandlingState>(set => ({
    behandlingId: undefined,
    erNyModell: false,
    rolle: 'INGEN',
    setBehandlingId: (behandlingId: string | undefined): void => set({ behandlingId }),
    setRolle: (rolle: InnloggetRolleEnum): void => set({ rolle }),
    setErNyModell: (erNyModell: boolean): void => set({ erNyModell }),
}));
