import type { AxiosResponse } from 'axios';

import axios from 'axios';

axios.defaults.baseURL = window.location.origin;
export const preferredAxios = axios;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiLoggFeil = (melding: string): Promise<AxiosResponse<any, any>> => {
    return preferredAxios.post('/logg-feil', {
        melding,
    });
};
