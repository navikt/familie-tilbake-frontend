import React from 'react';

import axe from '@axe-core/react';
import * as Sentry from '@sentry/browser';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

import App from './komponenter/App';

// eslint-disable-next-line
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
    axe(React, ReactDOM, 1000, {});
}

const container = document.getElementById('app');
// eslint-disable-next-line
const root = createRoot(container!);
root.render(<App />);
