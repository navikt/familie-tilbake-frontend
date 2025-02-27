import type { IBehandlingsstegstilstand, Venteårsak } from '../../typer/behandling';

import * as React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { styled } from 'styled-components';

import BehandlingContainer from './BehandlingContainer';
import Personlinje from './Personlinje/Personlinje';
import { useBehandling } from '../../context/BehandlingContext';
import { useFagsak } from '../../context/FagsakContext';
import { Fagsystem } from '../../kodeverk';
import { venteårsaker } from '../../typer/behandling';
import { RessursStatus } from '../../typer/ressurs';
import { formatterDatostring } from '../../utils';
import DataLastIkkeSuksess from '../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { FTAlertStripe } from '../Felleskomponenter/Flytelementer';
import HenterBehandling from '../Felleskomponenter/Modal/HenterBehandling';
import PåVentModal from '../Felleskomponenter/Modal/PåVent/PåVentModal';

const HØYDE_HEADER = 48;
const HØYDE_PERSONLINJE = 48;
const HØYDE_FTALERTSTRIPE = 62;

const FagsakContainerContent = styled.div`
    display: flex;
    height: calc(100vh - ${HØYDE_HEADER + HØYDE_PERSONLINJE}px);

    &.venter {
        height: calc(100vh - ${HØYDE_HEADER + HØYDE_PERSONLINJE + HØYDE_FTALERTSTRIPE}px);
    }
`;

const venteBeskjed = (ventegrunn: IBehandlingsstegstilstand) => {
    return `Behandlingen er satt på vent: ${
        venteårsaker[ventegrunn.venteårsak as Venteårsak]
    }. Tidsfrist: ${formatterDatostring(ventegrunn.tidsfrist as string)}`;
};

const FagsakContainer: React.FC = () => {
    const { fagsystem: fagsystemParam, fagsakId } = useParams();
    const fagsystem = Fagsystem[fagsystemParam as keyof typeof Fagsystem];

    const location = useLocation();
    const behandlingId = location.pathname.split('/')[6];

    const { fagsak, hentFagsak } = useFagsak();
    const {
        behandling,
        hentBehandlingMedEksternBrukId,
        ventegrunn,
        visVenteModal,
        settVisVenteModal,
    } = useBehandling();

    React.useEffect(() => {
        if (!!fagsystem && !!fagsakId) {
            hentFagsak(fagsystem, fagsakId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fagsystem, fagsakId]);

    React.useEffect(() => {
        if (fagsak?.status === RessursStatus.SUKSESS && behandlingId) {
            hentBehandlingMedEksternBrukId(fagsak.data, behandlingId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fagsak, behandlingId]);

    const lukkVenteModal = () => {
        settVisVenteModal(false);
    };

    if (fagsak?.status === RessursStatus.HENTER || behandling?.status === RessursStatus.HENTER) {
        return <HenterBehandling />;
    }

    if (fagsak?.status === RessursStatus.SUKSESS && behandling?.status === RessursStatus.SUKSESS) {
        return (
            <>
                <Personlinje bruker={fagsak.data.bruker} fagsak={fagsak.data} />

                {ventegrunn && (
                    <FTAlertStripe variant="info">{venteBeskjed(ventegrunn)}</FTAlertStripe>
                )}
                {visVenteModal && ventegrunn && (
                    <PåVentModal
                        behandling={behandling.data}
                        ventegrunn={ventegrunn}
                        onClose={lukkVenteModal}
                    />
                )}

                <FagsakContainerContent className={ventegrunn ? 'venter' : ''}>
                    <BehandlingContainer fagsak={fagsak.data} behandling={behandling.data} />
                </FagsakContainerContent>
            </>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[behandling, fagsak]} />;
    }
};

export default FagsakContainer;
