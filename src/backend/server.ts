import './konfigurerApp';

import express from 'express';
import { createServer as createViteServer } from 'vite';

import backend from './backend';
import { sessionConfig } from './config';
import { prometheusTellere } from './metrikker';

async function createServer() {
    const app = express();

    // Initialize backend with session and metrics
    const { router } = await backend(sessionConfig, prometheusTellere);

    if (process.env.NODE_ENV === 'development') {
        // Create Vite server in middleware mode
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });

        // Use vite's connect instance as middleware
        app.use(vite.middlewares);
    }

    // Setup authentication routes
    app.use('/', router);

    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

createServer();
