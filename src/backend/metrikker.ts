import { Counter } from 'prom-client';

export const prometheusTellere = {
    appLoad: new Counter({
        help: 'Counter for times app has been loaded',
        labelNames: ['code'],
        name: 'app_load',
    }),
    loginRoute: new Counter({
        help: 'Counter for times login route is requested',
        labelNames: ['code'],
        name: 'login_route',
    }),
};
