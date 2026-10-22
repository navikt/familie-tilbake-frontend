import React from 'react';
import { createRoot } from 'react-dom/client';

import './utils/apm';
import './api/http/configureHeyApi';
import { App } from './App';
import { loadTracker } from './utils/sporing';
import { configureZod } from './utils/zodConfig';

import './index.css';

if (process.env.NODE_ENV !== 'production') {
    void Promise.all([import('@axe-core/react'), import('react-dom')]).then(
        ([{ default: axe }, ReactDOM]) => {
            axe(React, ReactDOM, 1000, {});
        }
    );
}

loadTracker();
configureZod();

const container = document.getElementById('app');

if (!container) {
    throw new Error('Fant ikke rot-element: "app"');
}

createRoot(container).render(<App />);
