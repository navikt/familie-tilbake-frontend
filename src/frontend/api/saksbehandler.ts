import type { ISaksbehandler } from '../typer/saksbehandler';

import { preferredAxios } from './http/axios';

export const hentInnloggetBruker = async (): Promise<ISaksbehandler> => {
    const svar = await preferredAxios.get<ISaksbehandler>(`/user/profile`);
    return svar.data;
};
