import type { FC } from 'react';
import type { Brevmottaker } from '~/generated';

import { MagnifyingGlassIcon } from '@navikt/aksel-icons';
import { Button, LocalAlert } from '@navikt/ds-react';

import { BrevmottakerListe } from '~/komponenter/brevmottaker-liste/BrevmottakerListe';
import { useStegNavigering } from '~/utils/sider';

type Props = {
    brevmottakere: Brevmottaker[];
};

export const BrevmottakereAlert: FC<Props> = ({ brevmottakere }) => {
    const navigerTilBrevmottakerSteg = useStegNavigering('BREVMOTTAKER');
    return (
        brevmottakere &&
        brevmottakere.length !== 0 && (
            <LocalAlert status="announcement">
                <LocalAlert.Content>
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
                </LocalAlert.Content>
            </LocalAlert>
        )
    );
};
