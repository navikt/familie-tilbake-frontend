import type { FC } from 'react';

import { Suspense, useEffect } from 'react';
import { Outlet, useParams } from 'react-router';

import { BehandlingProvider, finnBehandlingId } from '@/context/BehandlingContext';
import { BehandlingStateProvider } from '@/context/BehandlingStateContext';
import { FagsakProvider, useFagsak } from '@/context/FagsakContext';
import { tilFagsystem } from '@/kodeverk';
import { FagsakErrorBoundary } from '@/komponenter/error-boundary/FagsakErrorBoundary';
import { UlagretDataModal } from '@/komponenter/modal/UlagretDataModal';
import { useBehandlingStore } from '@/stores/behandlingStore';
import { useFagsakStore } from '@/stores/fagsakStore';

import { IkkeFunnet } from '../feilsider/IkkeFunnet';
import { BehandlingContainer } from './Behandling';
import { BehandlingSkeleton } from './BehandlingSkeleton';

const FagsakStoreSynk: FC = () => {
    const { fagsystem, eksternFagsakId, bruker } = useFagsak();
    const { setEksternFagsakId, setFagsystem, setPersonIdent, resetFagsak } = useFagsakStore();

    useEffect(() => {
        setPersonIdent(bruker.personIdent);
        setEksternFagsakId(eksternFagsakId);
        setFagsystem(fagsystem);

        return (): void => resetFagsak();
    }, [
        fagsystem,
        eksternFagsakId,
        bruker.personIdent,
        setEksternFagsakId,
        setFagsystem,
        setPersonIdent,
        resetFagsak,
    ]);

    return null;
};

export const FagsakSide: FC = () => {
    const { fagsystem: fagsystemParam, fagsakId: eksternFagsakId } = useParams();
    const fagsystem = tilFagsystem(fagsystemParam);

    if (!fagsystem || !eksternFagsakId) {
        return <IkkeFunnet />;
    }

    return (
        <Suspense fallback={<BehandlingSkeleton />}>
            <FagsakErrorBoundary>
                <FagsakProvider fagsystem={fagsystem} eksternFagsakId={eksternFagsakId}>
                    <FagsakStoreSynk />
                    <Outlet />
                </FagsakProvider>
            </FagsakErrorBoundary>
        </Suspense>
    );
};

export const BehandlingSide: FC = () => {
    const { eksternBrukId } = useParams();
    const { behandlinger } = useFagsak();
    const setBehandlingId = useBehandlingStore(state => state.setBehandlingId);

    const behandlingId = eksternBrukId ? finnBehandlingId(behandlinger, eksternBrukId) : undefined;

    useEffect(() => {
        setBehandlingId(eksternBrukId);

        return (): void => setBehandlingId(undefined);
    }, [eksternBrukId, setBehandlingId]);

    if (!behandlingId) {
        return <IkkeFunnet />;
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
