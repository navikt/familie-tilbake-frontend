import type { Brevmottaker, ManuellBrevmottakerResponsDto } from '../../../generated';

import React from 'react';

import { BrevmottakerFormModal } from './BrevmottakerFormModal';
import { mapBrevmottakerToFormData } from './schema/brevmottakerSchema';

const hentEksisterendeBrevmottaker = (
    brevmottakerIdTilEndring: string,
    brevmottakere: ManuellBrevmottakerResponsDto[]
): Brevmottaker | undefined => {
    const manuellMottaker = brevmottakere.find(({ id }) => id === brevmottakerIdTilEndring);

    return manuellMottaker?.brevmottaker;
};

type BrevmottakerModalProps = {
    visBrevmottakerModal: boolean;
    brevmottakerIdTilEndring: string | undefined;
    behandlingId: string;
    brevmottakere: ManuellBrevmottakerResponsDto[];
    settVisBrevmottakerModal: (vis: boolean) => void;
    settBrevmottakerIdTilEndring: (id: string | undefined) => void;
};

export const BrevmottakerModal: React.FC<BrevmottakerModalProps> = ({
    visBrevmottakerModal,
    brevmottakerIdTilEndring,
    behandlingId,
    brevmottakere,
    settVisBrevmottakerModal,
    settBrevmottakerIdTilEndring,
}) => {
    if (!visBrevmottakerModal) {
        return null;
    }

    if (brevmottakerIdTilEndring) {
        const eksisterendeMottaker = hentEksisterendeBrevmottaker(
            brevmottakerIdTilEndring,
            brevmottakere
        );

        if (eksisterendeMottaker) {
            const formData = mapBrevmottakerToFormData(eksisterendeMottaker);
            return (
                <BrevmottakerFormModal
                    mode="endre"
                    initialData={formData}
                    mottakerId={brevmottakerIdTilEndring}
                    behandlingId={behandlingId}
                    visBrevmottakerModal={visBrevmottakerModal}
                    settVisBrevmottakerModal={settVisBrevmottakerModal}
                    settBrevmottakerIdTilEndring={settBrevmottakerIdTilEndring}
                />
            );
        }
    }

    return (
        <BrevmottakerFormModal
            mode="leggTil"
            behandlingId={behandlingId}
            visBrevmottakerModal={visBrevmottakerModal}
            settVisBrevmottakerModal={settVisBrevmottakerModal}
            settBrevmottakerIdTilEndring={settBrevmottakerIdTilEndring}
        />
    );
};
