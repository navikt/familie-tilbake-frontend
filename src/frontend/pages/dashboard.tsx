import { BodyLong, Heading } from '@navikt/ds-react';
import * as React from 'react';

export const Dashboard: React.FC = () => (
    <div className="p-3">
        <Heading size="xlarge">Nav - Tilbakekreving</Heading>
        <BodyLong size="small">
            Velkommen til felles saksbehandlingsløsning for tilbakekreving. Dette gjelder ytelsene
            barnetrygd, kontantstøtte, enslig forsørger, tilleggsstønader og
            arbeidsavklaringspenger. Flere ytelser vil komme senere.
        </BodyLong>
    </div>
);
