import * as React from 'react';

import { BodyShort, Cell, Grid, Loader, Modal } from '@navikt/ds-react';

const HenterBehandling: React.FC = () => {
    return (
        <Modal
            open
            header={{ heading: 'Henter behandling', size: 'medium', closeButton: false }}
            portal={true}
            width="small"
        >
            <Modal.Body>
                <Grid>
                    <Cell xs={10}>
                        <BodyShort>Henting av behandlingen tar litt tid.</BodyShort>
                        <BodyShort>Vennligst vent!</BodyShort>
                    </Cell>
                    <Cell xs={2}>
                        <Loader
                            size="xlarge"
                            title="venter..."
                            transparent={false}
                            variant="neutral"
                        />
                    </Cell>
                </Grid>
            </Modal.Body>
        </Modal>
    );
};

export default HenterBehandling;
