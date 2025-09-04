import type { FormData } from './types/FormData';
import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';

import React from 'react';

import { EndreBrevmottakerModal } from './EndreBrevmottakerModal';
import { LeggTilBrevmottakerModal } from './LeggTilBrevmottakerModal';
import { mapBrevmottakerToFormData } from './utils/brevmottakerMapper';
import { useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';
import { MottakerType, type IBrevmottaker } from '../../../typer/Brevmottaker';
import { type Ressurs, RessursStatus } from '../../../typer/ressurs';

const hentEksisterendeBrevmottaker = (
    brevmottakerIdTilEndring: string,
    behandling: Ressurs<IBehandling> | undefined,
    fagsak: Ressurs<IFagsak> | undefined
): IBrevmottaker | undefined => {
    if (behandling?.status === RessursStatus.Suksess && fagsak?.status === RessursStatus.Suksess) {
        if (brevmottakerIdTilEndring === 'default-user') {
            return {
                type: MottakerType.Bruker,
                navn: fagsak.data.bruker.navn,
                personIdent: fagsak.data.bruker.personIdent,
                isDefault: true,
            } as IBrevmottaker & { isDefault: boolean };
        } else {
            const manuellMottaker = behandling.data.manuelleBrevmottakere.find(
                (m: { id: string; brevmottaker: IBrevmottaker }) =>
                    m.id === brevmottakerIdTilEndring
            );
            if (manuellMottaker) {
                return manuellMottaker.brevmottaker;
            }
        }
    }
    return undefined;
};

interface BrevmottakerModalWrapperProps {
    mode: 'endre' | 'leggTil';
    eksisterendeMottaker?: Partial<FormData>;
    mottakerId?: string;
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
