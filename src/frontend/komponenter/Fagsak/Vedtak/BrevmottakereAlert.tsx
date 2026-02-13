import type { Brevmottaker } from '../../../generated';

import { MagnifyingGlassIcon } from '@navikt/aksel-icons';
import { Alert, Button } from '@navikt/ds-react';
import * as React from 'react';

import { Behandlingssteg } from '../../../typer/behandling';
import { useStegNavigering } from '../../../utils/sider';
import { BrevmottakerListe } from '../../Felleskomponenter/Hendelsesoversikt/BrevModul/BrevmottakerListe';

type Props = {
    brevmottakere: Brevmottaker[];
};

export const BrevmottakereAlert: React.FC<Props> = ({ brevmottakere }) => {
    const navigerTilBrevmottakerSteg = useStegNavigering(Behandlingssteg.Brevmottaker);
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
