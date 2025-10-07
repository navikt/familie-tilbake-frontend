import type { Behandlingsstegstilstand, Venteårsak } from '../../typer/behandling';

import * as React from 'react';
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router';
import { styled } from 'styled-components';

import BehandlingContainer from './BehandlingContainer';
import { Fagsystem } from '../../kodeverk';
import Personlinje from './Personlinje/Personlinje';
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

const venteBeskjed = (ventegrunn: Behandlingsstegstilstand): string => {
    return `Behandlingen er satt på vent: ${
        venteårsaker[ventegrunn.venteårsak as Venteårsak]
    }. Tidsfrist: ${formatterDatostring(ventegrunn.tidsfrist as string)}`;
};

const FagsakContainer: React.FC = () => {
    const { fagsystem: fagsystemParam, fagsakId: eksternFagsakId } = useParams();
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
    const setPersonIdent = useBehandlingStore(state => state.setPersonIdent);
    const setBehandlingId = useBehandlingStore(state => state.setBehandlingId);
    const setEksternFagsakId = useFagsakStore(state => state.setEksternFagsakId);
    const setFagSystem = useFagsakStore(state => state.setFagsystem);
    const setYtelsestype = useFagsakStore(state => state.setYtelsestype);
    const setSpråkkode = useFagsakStore(state => state.setSpråkkode);

    useEffect(() => {
        if (!!fagsystem && !!eksternFagsakId) {
            hentFagsak(fagsystem, eksternFagsakId);
        }
        return (): void => {
            setEksternFagsakId(undefined);
            setYtelsestype(undefined);
            setFagSystem(undefined);
            setSpråkkode(undefined);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fagsystem, eksternFagsakId]);

    useEffect(() => {
        if (fagsak?.status === RessursStatus.Suksess && behandlingId) {
            hentBehandlingMedEksternBrukId(fagsak.data, behandlingId);
            setBehandlingId(behandlingId);
        }

        if (fagsak?.status === RessursStatus.Suksess && fagsak?.data?.bruker.personIdent) {
            setPersonIdent(fagsak.data.bruker.personIdent);
        }
        return (): void => {
            setBehandlingId(undefined);
            setPersonIdent(undefined);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fagsak, behandlingId]);

    const lukkVenteModal = (): void => {
        settVisVenteModal(false);
    };

    if (fagsak?.status === RessursStatus.Henter || behandling?.status === RessursStatus.Henter) {
        return <HenterBehandling />;
    }

    if (fagsak?.status === RessursStatus.Suksess && behandling?.status === RessursStatus.Suksess) {
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
        return (
            <DataLastIkkeSuksess
                ressurser={[behandling, fagsak]}
                behandlingId={behandlingId}
                eksternFagsakId={eksternFagsakId}
                visFeilSide
            />
        );
    }
};

export default FagsakContainer;
