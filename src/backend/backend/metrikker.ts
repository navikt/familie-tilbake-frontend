import type { Express, Request } from 'express';

import { type Counter, collectDefaultMetrics, Registry } from '@prometheus-io/client';

export const konfigurerMetrikker = (
    app: Express,
    prometheusTellere?: { [key: string]: Counter<string> }
): Registry => {
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
