import { preferredAxios } from './http/axios';
import { ISaksbehandler } from '../typer/saksbehandler';

export const hentInnloggetBruker = async (): Promise<ISaksbehandler> => {
    const svar = await preferredAxios.get<ISaksbehandler>(`/user/profile`);
    return svar.data;
};
