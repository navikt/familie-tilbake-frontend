import axios from 'axios';

axios.defaults.baseURL = window.location.origin;
export const preferredAxios = axios;

export const apiLoggFeil = (melding: string) => {
    return preferredAxios.post('/logg-feil', {
        melding,
    });
};
