import * as React from 'react';

import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';

import AlertStripe from 'nav-frontend-alertstriper';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../context/BehandlingContext';
import { useFagsak } from '../../context/FagsakContext';
import { Fagsystem } from '../../kodeverk';
import BehandlingContainer from './BehandlingContainer';
import Personlinje from './Personlinje/Personlinje';
import {
    Behandlingsstegstatus,
    IBehandlingsstegstilstand,
    venteårsaker,
} from '../../typer/behandling';
import PåVentModal from '../Felleskomponenter/Modal/PåVentModal';

const FagsakContainerContent = styled.div`
    display: flex;
    height: calc(100vh - 6rem);
`;

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
    const { behandling, hentBehandling, harKravgrunnlag } = useBehandling();

    const [ventegrunn, settVentegrunn] = React.useState<IBehandlingsstegstilstand>();
    const [visVenteModal, settVisVenteModal] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (fagsystem !== undefined && fagsakId !== undefined) {
            hentFagsak(fagsystem, fagsakId);
        }
    }, [fagsystem, fagsakId]);

    React.useEffect(() => {
        if (fagsak?.status === RessursStatus.SUKSESS && behandlingId) {
            console.log('Skal hente behandling!');
            hentBehandling(fagsak.data, behandlingId);
            settVisVenteModal(false);
        }
    }, [fagsak, behandlingId]);

    React.useEffect(() => {
        if (behandling?.status === RessursStatus.SUKSESS) {
            const venteSteg = behandling.data.behandlingsstegsinfo?.find(
                stegInfo => stegInfo.behandlingsstegstatus === Behandlingsstegstatus.VENTER
            );
            if (venteSteg) {
                settVentegrunn(venteSteg);
                settVisVenteModal(true);
            }
        }
    }, [behandling]);

    const lukkVenteModal = () => {
        settVisVenteModal(false);
    };

    if (visVenteModal) {
        return <PåVentModal venteÅrsak={ventegrunn} onClose={lukkVenteModal} />;
    }

    switch (fagsak?.status) {
        case RessursStatus.SUKSESS: {
            switch (behandling?.status) {
                case RessursStatus.SUKSESS:
                    return (
                        <>
                            <Personlinje bruker={fagsak.data.bruker} fagsak={fagsak.data} />

                            {ventegrunn && (
                                <AlertStripe
                                    children={`Behandlingen er satt på vent${
                                        ventegrunn.venteårsak
                                            ? `: ${venteårsaker[ventegrunn.venteårsak]}`
                                            : ''
                                    }`}
                                    type={'info'}
                                />
                            )}

                            {harKravgrunnlag && (
                                <FagsakContainerContent>
                                    <BehandlingContainer
                                        fagsak={fagsak.data}
                                        behandling={behandling.data}
                                    />
                                </FagsakContainerContent>
                            )}
                        </>
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
