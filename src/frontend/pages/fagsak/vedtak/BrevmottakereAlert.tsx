import type { Brevmottaker } from '@generated';

import { BrevmottakerListe } from '@komponenter/brevmottaker-liste/BrevmottakerListe';
import { MagnifyingGlassIcon } from '@navikt/aksel-icons';
import { Alert, Button } from '@navikt/ds-react';
import { useStegNavigering } from '@utils/sider';
import * as React from 'react';

type Props = {
    brevmottakere: Brevmottaker[];
};

export const BrevmottakereAlert: React.FC<Props> = ({ brevmottakere }) => {
    const navigerTilBrevmottakerSteg = useStegNavigering('BREVMOTTAKER');
    return (
        brevmottakere &&
        brevmottakere.length !== 0 && (
            <Alert variant="info">
                Brevmottaker(e) er endret, og vedtak sendes til:
                <BrevmottakerListe />
                <Button
                    variant="tertiary"
                    onClick={navigerTilBrevmottakerSteg}
                    icon={<MagnifyingGlassIcon />}
                    size="xsmall"
                >
                    Se detaljer
                </Button>
            </Alert>
        )
    );
};
