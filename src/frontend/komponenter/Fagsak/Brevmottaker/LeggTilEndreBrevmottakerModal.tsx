import type { FormData } from './BrevmottakerForm';

import React from 'react';

import { EndreBrevmottakerModal } from './EndreBrevmottakerModal';
import { LeggTilBrevmottakerModal } from './LeggTilBrevmottakerModal';
import { useBehandling } from '../../../context/BehandlingContext';

interface BrevmottakerModalWrapperProps {
    mode: 'endre' | 'leggTil';
    eksisterendeMottaker?: Partial<FormData>;
}

export const BrevmottakerModalWrapper: React.FC<BrevmottakerModalWrapperProps> = ({
    mode,
    eksisterendeMottaker,
}) => {
    if (mode === 'endre' && eksisterendeMottaker) {
        return <EndreBrevmottakerModal eksisterendeMottaker={eksisterendeMottaker} />;
    }

    return <LeggTilBrevmottakerModal />;
};
export const LeggTilEndreBrevmottakerModal: React.FC = () => {
    const { visBrevmottakerModal } = useBehandling();

    if (!visBrevmottakerModal) {
        return null;
    }
    return <BrevmottakerModalWrapper mode="leggTil" />;
};
