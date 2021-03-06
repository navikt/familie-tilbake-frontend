import * as React from 'react';

import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';

import AlertStripe from 'nav-frontend-alertstriper';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../context/BehandlingContext';
import { useFagsak } from '../../context/FagsakContext';
import { Fagsystem } from '../../kodeverk';
import { IBehandlingsstegstilstand, Venteårsak, venteårsaker } from '../../typer/behandling';
import { formatterDatostring } from '../../utils';
import HenterBehandling from '../Felleskomponenter/Modal/HenterBehandling';
import PåVentModal from '../Felleskomponenter/Modal/PåVent/PåVentModal';
import BehandlingContainer from './BehandlingContainer';
import Personlinje from './Personlinje/Personlinje';

const FagsakContainerContent = styled.div`
    display: flex;
    height: calc(100vh - 6rem);
`;

const StyledAlertStripe = styled(AlertStripe)`
    .alertstripe__tekst {
        max-width: fit-content;
    }
`;

const venteBeskjed = (ventegrunn: IBehandlingsstegstilstand) => {
    return `Behandlingen er satt på vent: ${
        venteårsaker[ventegrunn.venteårsak as Venteårsak]
    }. Tidsfrist: ${formatterDatostring(ventegrunn.tidsfrist as string)}`;
};

interface IProps {
    fagsystem: string;
    fagsakId: string;
}

const FagsakContainer: React.FC = () => {
    const { fagsystem: fagsystemParam, fagsakId } = useParams<IProps>();
    const fagsystem = Fagsystem[fagsystemParam as keyof typeof Fagsystem];

    const history = useHistory();
    const behandlingId = history.location.pathname.split('/')[6];

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

    if (visVenteModal && ventegrunn && behandling?.status === RessursStatus.SUKSESS) {
        return (
            <PåVentModal
                behandling={behandling.data}
                ventegrunn={ventegrunn}
                onClose={lukkVenteModal}
            />
        );
    }

    switch (fagsak?.status) {
        case RessursStatus.SUKSESS: {
            switch (behandling?.status) {
                case RessursStatus.SUKSESS:
                    return !visVenteModal ? (
                        <>
                            <Personlinje bruker={fagsak.data.bruker} fagsak={fagsak.data} />

                            {ventegrunn && (
                                <StyledAlertStripe
                                    children={venteBeskjed(ventegrunn)}
                                    type={'info'}
                                />
                            )}
                            <FagsakContainerContent>
                                <BehandlingContainer
                                    fagsak={fagsak.data}
                                    behandling={behandling.data}
                                />
                            </FagsakContainerContent>
                        </>
                    ) : (
                        <div />
                    );
                case RessursStatus.IKKE_TILGANG:
                    return (
                        <AlertStripe
                            children={`Du har ikke tilgang til å se denne behandlingen.`}
                            type={'advarsel'}
                        />
                    );
                case RessursStatus.FEILET:
                case RessursStatus.FUNKSJONELL_FEIL:
                    return <AlertStripe children={behandling.frontendFeilmelding} type={'feil'} />;
                default:
                    return <div />;
            }
        }
        case RessursStatus.IKKE_TILGANG:
            return (
                <AlertStripe
                    children={`Du har ikke tilgang til å se denne saken.`}
                    type={'advarsel'}
                />
            );
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return <AlertStripe children={fagsak.frontendFeilmelding} type={'feil'} />;
        default:
            return <div />;
    }
};

export default FagsakContainer;
