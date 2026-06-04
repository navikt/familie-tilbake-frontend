import type { AxiosResponse, AxiosStatic } from 'axios';

import axios from 'axios';

axios.defaults.baseURL = window.location.origin;
export const preferredAxios: AxiosStatic = axios;

// biome-ignore lint/suspicious/noExplicitAny: ekstern AxiosResponse-payload er utypet
export const apiLoggFeil = (melding: string): Promise<AxiosResponse<any, any>> => {
    return preferredAxios.post('/logg-feil', {
        melding,
    });
};
