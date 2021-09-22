import React from 'react';

import axe from '@axe-core/react';
import { init } from '@sentry/browser';
import { Integrations } from '@sentry/tracing';
import ReactDOM from 'react-dom';

import App from './komponenter/App';

// eslint-disable-next-line
const packageConfig = require('../../package.json');
const environment = window.location.hostname;

if (process.env.NODE_ENV !== 'development') {
    init({
        dsn: 'https://e88ebf3bc63346d6a4c2baba674afed3@sentry.gc.nav.no/83',
        environment,
        release: packageConfig.version,
        integrations: [new Integrations.BrowserTracing()],
        tracesSampleRate: 0.2,
    });
}

if (process.env.NODE_ENV !== 'production') {
    axe(React, ReactDOM, 1000, {});
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('app')
);
