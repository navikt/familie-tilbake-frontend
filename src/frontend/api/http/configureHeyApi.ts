import type { AxiosInstance } from 'axios';

import { client as oldClient } from '@generated/client.gen';
import { client as newClient } from '@generated-new/client.gen';

const hentCsrfTokenFraMeta = (): string | null =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;

const setupInterceptor = (instance: AxiosInstance): void => {
    instance.interceptors.request.use(config => {
        const ikkeSikreMetoder = ['GET', 'HEAD', 'OPTIONS'];
        if (config.method && !ikkeSikreMetoder.includes(config.method.toUpperCase())) {
            const csrfToken = hentCsrfTokenFraMeta();
            if (csrfToken) {
                config.headers = {
                    ...config.headers,
                    'x-csrf-token': csrfToken,
                };
            }
        }
        return config;
    });
};

setupInterceptor(oldClient.instance);
setupInterceptor(newClient.instance);
