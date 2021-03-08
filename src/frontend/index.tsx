import React from 'react';

import axe from '@axe-core/react';
import ReactDOM from 'react-dom';

import App from './komponenter/App';

if (process.env.NODE_ENV !== 'production') {
    axe(React, ReactDOM, 1000, {});
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('app')
);
