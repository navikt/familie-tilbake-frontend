import * as React from 'react';

import classNames from 'classnames';

const Dashboard: React.FC = () => (
    <div className={classNames('dashboard')}>
        <h2>NAV Familie - Tilbakekreving</h2>
        <div>
            Velkommen til saksbehandlingsløsningen for tilbakekreving av ytelsene Barnetrygd,
            Konstantstøtte og Støtte til enslig forsørger.
        </div>
    </div>
);

export default Dashboard;
