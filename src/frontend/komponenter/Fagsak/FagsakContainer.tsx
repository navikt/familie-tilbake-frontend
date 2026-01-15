import type { Behandlingsstegstilstand, Venteårsak } from '../../typer/behandling';

import classNames from 'classnames';
import * as React from 'react';
import { Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import BehandlingContainer from './BehandlingContainer';
import {
    BehandlingProvider,
    finnBehandlingId,
    useBehandling,
} from '../../context/BehandlingContext';
import { useFagsak } from '../../context/FagsakContext';
import { useBehandlingStore } from '../../stores/behandlingStore';
import { useFagsakStore } from '../../stores/fagsakStore';
import { venteårsaker } from '../../typer/behandling';
import { formatterDatostring } from '../../utils';
import { FTAlertStripe } from '../Felleskomponenter/Flytelementer';
import HenterBehandling from '../Felleskomponenter/Modal/HenterBehandling';
import PåVentModal from '../Felleskomponenter/Modal/PåVent/PåVentModal';
import UlagretDataModal from '../Felleskomponenter/Modal/UlagretDataModal';

const venteBeskjed = (ventegrunn: Behandlingsstegstilstand): string => {
    return `Behandlingen er satt på vent: ${
        venteårsaker[ventegrunn.venteårsak as Venteårsak]
    }. Tidsfrist: ${formatterDatostring(ventegrunn.tidsfrist as string)}`;
};

const BehandlingContent: React.FC = () => {
    const { ventegrunn } = useBehandling();
    const [visVenteModal, settVisVenteModal] = useState(false);

    return (
        <>
            {ventegrunn && <FTAlertStripe variant="info">{venteBeskjed(ventegrunn)}</FTAlertStripe>}
            {ventegrunn && !visVenteModal && (
                <PåVentModal ventegrunn={ventegrunn} onClose={() => settVisVenteModal(true)} />
            )}
            <div
                className={classNames(
                    'grid grid-cols-1 ax-lg:grid-cols-[2fr_1fr] gap-4 p-4 bg-ax-neutral-100 min-h-screen',
                    {
                        venter: !!ventegrunn,
                    }
                )}
            >
                <BehandlingContainer />
            </div>
        </>
    );
};

const FagsakContainer: React.FC = () => {
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
        <Suspense fallback={<HenterBehandling />}>
            <BehandlingProvider behandlingId={behandlingId}>
                <BehandlingContent />
                <UlagretDataModal />
            </BehandlingProvider>
        </Suspense>
    );
};

export default FagsakContainer;
