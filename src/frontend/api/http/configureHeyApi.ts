import type { AxiosInstance } from 'axios';

import { client as oldClient } from '@generated/client.gen';
import { client as newClient } from '@generated-new/client.gen';

const setupInterceptor = (instance: AxiosInstance): void => {
    instance.interceptors.request.use(config => config);
};

setupInterceptor(oldClient.instance);
setupInterceptor(newClient.instance);
