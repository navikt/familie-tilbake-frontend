import * as React from 'react';

import { BodyShort, Cell, Grid, Loader } from '@navikt/ds-react';

import UIModalWrapper from './UIModalWrapper';

const HenterBehandling: React.FC = () => {
    return (
        <UIModalWrapper
            modal={{
                tittel: 'Henter behandling',
                lukkKnapp: false,
                visModal: true,
            }}
            style={{
                overlay: {
                    backgroundColor: 'var(--navds-global-color-gray-400)',
                },
            }}
        >
            <Grid>
                <Cell xs={10}>
                    <BodyShort>Henting av behandlingen tar litt tid.</BodyShort>
                    <BodyShort>Vennligst vent!</BodyShort>
                </Cell>
                <Cell xs={2}>
                    <Loader size="xlarge" title="venter..." transparent={false} variant="neutral" />
                </Cell>
            </Grid>
        </UIModalWrapper>
    );
};

export default HenterBehandling;
