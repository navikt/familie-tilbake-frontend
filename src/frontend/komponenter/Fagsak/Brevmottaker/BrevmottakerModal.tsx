import type { IBehandling } from '../../../typer/behandling';
import type { IBrevmottaker } from '../../../typer/Brevmottaker';
import type { IFagsak } from '../../../typer/fagsak';
import type { Ressurs } from '../../../typer/ressurs';

import React from 'react';

import { BrevmottakerFormModal } from './BrevmottakerFormModal';
import { mapBrevmottakerToFormData } from './schema/brevmottakerSchema';
import { useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';
import { RessursStatus } from '../../../typer/ressurs';

const hentEksisterendeBrevmottaker = (
    brevmottakerIdTilEndring: string,
    behandling: Ressurs<IBehandling> | undefined,
    fagsak: Ressurs<IFagsak> | undefined
): IBrevmottaker | undefined => {
    if (behandling?.status !== RessursStatus.Suksess || fagsak?.status !== RessursStatus.Suksess) {
        return undefined;
    }

    const manuellMottaker = behandling.data.manuelleBrevmottakere.find(
        (m: { id: string; brevmottaker: IBrevmottaker }) => m.id === brevmottakerIdTilEndring
    );

    return manuellMottaker?.brevmottaker;
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
                <BrevmottakerFormModal
                    mode="endre"
                    initialData={formData}
                    mottakerId={brevmottakerIdTilEndring}
                />
            );
        }
    }

    return <BrevmottakerFormModal mode="leggTil" />;
};
