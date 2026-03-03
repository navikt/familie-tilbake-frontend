import type { FC } from 'react';

import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { BehandlingProvider, finnBehandlingId } from '~/context/BehandlingContext';
import { BehandlingStateProvider } from '~/context/BehandlingStateContext';
import { useFagsak } from '~/context/FagsakContext';
import { UlagretDataModal } from '~/komponenter/modal/UlagretDataModal';
import { useBehandlingStore } from '~/stores/behandlingStore';
import { useFagsakStore } from '~/stores/fagsakStore';

import { BehandlingContainer } from './Behandling';

export const FagsakContainer: FC = () => {
    const location = useLocation();
    const eksternBrukId = location.pathname.split('/')[6];

    const { fagsystem, eksternFagsakId, bruker, behandlinger } = useFagsak();
    const { setBehandlingId } = useBehandlingStore();
    const { setEksternFagsakId, setFagsystem, setPersonIdent, resetFagsak } = useFagsakStore();

    const behandlingId = eksternBrukId ? finnBehandlingId(behandlinger, eksternBrukId) : undefined;

    useEffect(() => {
        if (eksternBrukId) {
            setBehandlingId(eksternBrukId);
        }

        setPersonIdent(bruker.personIdent);
        setEksternFagsakId(eksternFagsakId);
        setFagsystem(fagsystem);

        return (): void => {
            setBehandlingId(undefined);
            setPersonIdent(undefined);
            resetFagsak();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fagsystem, eksternFagsakId, bruker.personIdent, eksternBrukId]);

    if (!behandlingId) {
        return null;
    }

    return (
        <BehandlingProvider behandlingId={behandlingId}>
            <BehandlingStateProvider>
                <BehandlingContainer />
                <UlagretDataModal />
            </BehandlingStateProvider>
        </BehandlingProvider>
    );
};
