import * as React from 'react';

import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import App from './komponenter/App';

import './index.less';

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
