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
    const { fagsystem, tilbakekrevingSakId, bruker, fagsakBehandlingUrl } = useFagsak();
    const {
        setTilbakekrevingSakId,
        setFagsystem,
        setPersonIdent,
        setFagsakBehandlingUrl,
        resetFagsak,
    } = useFagsakStore();

    useEffect(() => {
        setPersonIdent(bruker.personIdent);
        setTilbakekrevingSakId(tilbakekrevingSakId);
        setFagsystem(fagsystem);
        setFagsakBehandlingUrl(fagsakBehandlingUrl);

        return (): void => resetFagsak();
    }, [
        fagsystem,
        tilbakekrevingSakId,
        bruker.personIdent,
        fagsakBehandlingUrl,
        setTilbakekrevingSakId,
        setFagsystem,
        setPersonIdent,
        setFagsakBehandlingUrl,
        resetFagsak,
    ]);

    return null;
};

export const FagsakSide: FC = () => {
    const { fagsystem: fagsystemParam, fagsakId: tilbakekrevingSakId } = useParams();
    const fagsystem = tilFagsystem(fagsystemParam);

    if (!fagsystem || !tilbakekrevingSakId) {
        return <IkkeFunnet />;
    }

    return (
        <Suspense fallback={<BehandlingSkeleton />}>
            <FagsakErrorBoundary>
                <FagsakProvider fagsystem={fagsystem} tilbakekrevingSakId={tilbakekrevingSakId}>
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
