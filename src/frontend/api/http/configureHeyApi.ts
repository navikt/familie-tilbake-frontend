import { client } from '../../generated/client.gen';

const hentCsrfTokenFraMeta = (): string | null =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;

client.instance.interceptors.request.use(config => {
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
