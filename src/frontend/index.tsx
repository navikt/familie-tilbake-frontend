import * as React from 'react';

import axe from '@axe-core/react';
import * as ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader';

import App from './komponenter/App';

if (process.env.NODE_ENV !== 'production') {
    axe(React, ReactDOM, 1000, {});
}

const rootElement = document.getElementById('app');
const renderApp = (Component: React.ComponentType): void => {
    ReactDOM.render(
        <React.StrictMode>
            <Component />
        </React.StrictMode>,
        rootElement
    );
};

renderApp(hot(module)(App));
