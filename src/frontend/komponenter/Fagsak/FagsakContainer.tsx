import * as React from 'react';

import { useLocation, useParams } from 'react-router-dom';
import { styled } from 'styled-components';

import { Alert } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import BehandlingContainer from './BehandlingContainer';
import Personlinje from './Personlinje/Personlinje';
import { useBehandling } from '../../context/BehandlingContext';
import { useFagsak } from '../../context/FagsakContext';
import { Fagsystem } from '../../kodeverk';
import { IBehandlingsstegstilstand, Venteårsak, venteårsaker } from '../../typer/behandling';
import { formatterDatostring } from '../../utils';
import { FTAlertStripe } from '../Felleskomponenter/Flytelementer';
import HenterBehandling from '../Felleskomponenter/Modal/HenterBehandling';
import PåVentModal from '../Felleskomponenter/Modal/PåVent/PåVentModal';

const FagsakContainerContent = styled.div`
    display: flex;
    height: calc(100vh - 7rem);

    &.venter {
        height: calc(100vh - 10.9rem);
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
    }, [fagsystem, fagsakId]);

    React.useEffect(() => {
        if (fagsak?.status === RessursStatus.SUKSESS && behandlingId) {
            hentBehandlingMedEksternBrukId(fagsak.data, behandlingId);
        }
    }, [fagsak, behandlingId]);

    const lukkVenteModal = () => {
        settVisVenteModal(false);
    };

    if (fagsak?.status === RessursStatus.HENTER || behandling?.status === RessursStatus.HENTER) {
        return <HenterBehandling />;
    }

    switch (fagsak?.status) {
        case RessursStatus.SUKSESS: {
            switch (behandling?.status) {
                case RessursStatus.SUKSESS:
                    return (
                        <>
                            <Personlinje bruker={fagsak.data.bruker} fagsak={fagsak.data} />

                            {ventegrunn && (
                                <FTAlertStripe children={venteBeskjed(ventegrunn)} variant="info" />
                            )}
                            {visVenteModal && ventegrunn && (
                                <PåVentModal
                                    behandling={behandling.data}
                                    ventegrunn={ventegrunn}
                                    onClose={lukkVenteModal}
                                />
                            )}

                            <FagsakContainerContent className={ventegrunn ? 'venter' : ''}>
                                <BehandlingContainer
                                    fagsak={fagsak.data}
                                    behandling={behandling.data}
                                />
                            </FagsakContainerContent>
                        </>
                    );
                case RessursStatus.IKKE_TILGANG:
                    return (
                        <Alert
                            children={`Du har ikke tilgang til å se denne behandlingen.`}
                            variant="warning"
                        />
                    );
                case RessursStatus.FEILET:
                case RessursStatus.FUNKSJONELL_FEIL:
                    return <Alert children={behandling.frontendFeilmelding} variant="error" />;
                default:
                    return <Alert variant="info">Venter på data om behandlingen</Alert>;
            }
        }
        case RessursStatus.IKKE_TILGANG:
            return (
                <Alert children={`Du har ikke tilgang til å se denne saken.`} variant="warning" />
            );
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return <Alert children={fagsak.frontendFeilmelding} variant="error" />;
        default:
            return <Alert variant="info">Venter på data om fagsaken</Alert>;
    }
};

export default FagsakContainer;
