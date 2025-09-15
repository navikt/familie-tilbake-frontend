import type { BrevmottakerFormData } from './schema/brevmottakerSchema';

import React from 'react';

import { EndreBrevmottakerModal } from './EndreBrevmottakerModal';
import { LeggTilBrevmottakerModal } from './LeggTilBrevmottakerModal';
import { mapBrevmottakerToFormData } from './schema/brevmottakerSchema';
import { hentEksisterendeBrevmottaker } from './utils/brevmottakerHelper';
import { useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';

interface BrevmottakerModalWrapperProps {
    readonly mode: 'endre' | 'leggTil';
    readonly eksisterendeMottaker?: Partial<BrevmottakerFormData>;
    readonly mottakerId?: string;
}

export const BrevmottakerModalWrapper: React.FC<BrevmottakerModalWrapperProps> = ({
    mode,
    eksisterendeMottaker,
    mottakerId,
}) => {
    if (mode === 'endre' && eksisterendeMottaker) {
        return (
            <EndreBrevmottakerModal
                eksisterendeMottaker={eksisterendeMottaker}
                mottakerId={mottakerId}
            />
        );
    }

    return <LeggTilBrevmottakerModal />;
};
export const BrevmottakerModal: React.FC = () => {
    const { visBrevmottakerModal, brevmottakerIdTilEndring, behandling } = useBehandling();
    const { fagsak } = useFagsak();

    if (!visBrevmottakerModal) {
        return null;
    }

    if (brevmottakerIdTilEndring) {
        const eksisterendeMottaker = hentEksisterendeBrevmottaker(
            brevmottakerIdTilEndring,
            behandling,
            fagsak
        );

        if (eksisterendeMottaker) {
            const formData = mapBrevmottakerToFormData(eksisterendeMottaker);
            return (
                <BrevmottakerModalWrapper
                    mode="endre"
                    eksisterendeMottaker={formData}
                    mottakerId={brevmottakerIdTilEndring}
                />
            );
        }
    }

    return <BrevmottakerModalWrapper mode="leggTil" />;
};
