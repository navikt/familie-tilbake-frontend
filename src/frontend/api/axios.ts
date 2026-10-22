import type { AxiosStatic } from 'axios';

import axios from 'axios';

axios.defaults.baseURL = window.location.origin;
export const preferredAxios: AxiosStatic = axios;
