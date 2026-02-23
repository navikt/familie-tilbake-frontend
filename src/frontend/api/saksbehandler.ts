import type { Saksbehandler } from '~/typer/saksbehandler';

import { preferredAxios } from './http/axios';

export const hentInnloggetBruker = async (): Promise<Saksbehandler> => {
    const svar = await preferredAxios.get<Saksbehandler>(`/user/profile`);
    return svar.data;
};
