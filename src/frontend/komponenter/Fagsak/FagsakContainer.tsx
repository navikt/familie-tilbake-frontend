import type { Behandlingsstegstilstand, Venteårsak } from '../../typer/behandling';

import classNames from 'classnames';
import * as React from 'react';
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router';

import BehandlingContainer from './BehandlingContainer';
import { useBehandling } from '../../context/BehandlingContext';
import { useFagsak } from '../../context/FagsakContext';
import { useBehandlingStore } from '../../stores/behandlingStore';
import { useFagsakStore } from '../../stores/fagsakStore';
import { venteårsaker } from '../../typer/behandling';
import { RessursStatus } from '../../typer/ressurs';
import { formatterDatostring } from '../../utils';
import DataLastIkkeSuksess from '../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { FTAlertStripe } from '../Felleskomponenter/Flytelementer';
import HenterBehandling from '../Felleskomponenter/Modal/HenterBehandling';
import PåVentModal from '../Felleskomponenter/Modal/PåVent/PåVentModal';

const venteBeskjed = (ventegrunn: Behandlingsstegstilstand): string => {
    return `Behandlingen er satt på vent: ${
        venteårsaker[ventegrunn.venteårsak as Venteårsak]
    }. Tidsfrist: ${formatterDatostring(ventegrunn.tidsfrist as string)}`;
};

const FagsakContainer: React.FC = () => {
    const { fagsakId: eksternFagsakId } = useParams();
    const location = useLocation();
    const behandlingId = location.pathname.split('/')[6];

    const { fagsak, isLoading } = useFagsak();
    const {
        behandling,
        hentBehandlingMedEksternBrukId,
        ventegrunn,
        visVenteModal,
        settVisVenteModal,
    } = useBehandling();

    const setPersonIdent = useBehandlingStore(state => state.setPersonIdent);
    const setBehandlingId = useBehandlingStore(state => state.setBehandlingId);
    const { setEksternFagsakId, setFagsystem, resetFagsak } = useFagsakStore();

    useEffect(() => {
        if (fagsak && behandlingId) {
            hentBehandlingMedEksternBrukId(fagsak, behandlingId);
            setBehandlingId(behandlingId);
        }

        if (fagsak?.bruker.personIdent) {
            setPersonIdent(fagsak.bruker.personIdent);
        }

        if (fagsak?.eksternFagsakId) {
            setEksternFagsakId(fagsak.eksternFagsakId);
        }

        if (fagsak?.fagsystem) {
            setFagsystem(fagsak.fagsystem);
        }

        return (): void => {
            setBehandlingId(undefined);
            setPersonIdent(undefined);
            resetFagsak();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fagsak, behandlingId]);

    if (isLoading || behandling?.status === RessursStatus.Henter) {
        return <HenterBehandling />;
    }

    if (fagsak && behandling?.status === RessursStatus.Suksess) {
        return (
            <>
                {ventegrunn && (
                    <FTAlertStripe variant="info">{venteBeskjed(ventegrunn)}</FTAlertStripe>
                )}
                {visVenteModal && ventegrunn && (
                    <PåVentModal
                        behandling={behandling.data}
                        ventegrunn={ventegrunn}
                        onClose={() => settVisVenteModal(false)}
                    />
                )}
                <div
                    className={classNames(
                        'grid grid-cols-1 ax-lg:grid-cols-[2fr_1fr] gap-4 p-4 bg-ax-neutral-100 min-h-screen',
                        {
                            venter: !!ventegrunn,
                        }
                    )}
                >
                    <BehandlingContainer behandling={behandling.data} />
                </div>
            </>
        );
    } else {
        return (
            <DataLastIkkeSuksess
                ressurser={[behandling]}
                behandlingId={behandlingId}
                eksternFagsakId={eksternFagsakId}
                visFeilSide
            />
        );
    }
};

export default FagsakContainer;
