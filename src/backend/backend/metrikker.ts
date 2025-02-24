import { Express, Request } from 'express';
import client, { Counter } from 'prom-client';

export const konfigurerMetrikker = (
    app: Express,
    prometheusTellere?: { [key: string]: Counter<string> }
) => {
    const collectDefaultMetrics = client.collectDefaultMetrics;
    const Registry = client.Registry;
    const register = new Registry();

    collectDefaultMetrics({ register });

    if (prometheusTellere) {
        Object.values(prometheusTellere).forEach(counter => {
            register.registerMetric(counter);
        });
    }

    app.get('/metrics', async (_: Request, res) => {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    });

    return register;
};
