import * as Sentry from '@sentry/browser';
import React from 'react';
import { createRoot } from 'react-dom/client';

import './api/http/configureHeyApi';
import { App } from './App';
import { initGrafanaFaro } from './utils/grafanaFaro';

import './index.css';

const environment = window.location.hostname;

if (process.env.NODE_ENV !== 'development') {
    Sentry.init({
        dsn: 'https://e88ebf3bc63346d6a4c2baba674afed3@sentry.gc.nav.no/83',
        environment,
        integrations: [Sentry.browserTracingIntegration()],
        tracesSampleRate: 0.2,
    });
}

if (process.env.NODE_ENV !== 'production') {
    void Promise.all([import('@axe-core/react'), import('react-dom')]).then(
        ([{ default: axe }, ReactDOM]) => {
            axe(React, ReactDOM, 1000, {});
        }
    );
}

initGrafanaFaro();

const container = document.getElementById('app');

if (!container) {
    throw new Error('Fant ikke rot-element: "app"');
}

createRoot(container).render(<App />);
