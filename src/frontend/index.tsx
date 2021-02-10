import * as React from 'react';

import axe from '@axe-core/react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import App from './komponenter/App';

if (process.env.NODE_ENV !== 'production') {
    axe(React, ReactDOM, 1000, {});
}

const rootElement = document.getElementById('app');
const renderApp = (Component: React.ComponentType): void => {
    ReactDOM.render(
        <AppContainer>
            <React.StrictMode>
                <Component />
            </React.StrictMode>
        </AppContainer>,
        rootElement
    );
};

renderApp(App);

if (module.hot) {
    module.hot.accept('./komponenter/App', () => {
        // eslint-disable-next-line
        const NewApp = require('./komponenter/App').default;
        renderApp(NewApp);
    });
}
