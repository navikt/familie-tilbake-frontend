import * as React from 'react';

import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../context/BehandlingContext';
import { useFagsak } from '../../context/FagsakContext';
import { Fagsystem } from '../../kodeverk';
import BehandlingContainer from './BehandlingContainer';
import Personlinje from './Personlinje/Personlinje';
import AlertStripe from 'nav-frontend-alertstriper';

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
    const { behandling, hentBehandling } = useBehandling();

    React.useEffect(() => {
        if (fagsystem !== undefined && fagsakId !== undefined) {
            hentFagsak(fagsystem, fagsakId);
        }
    }, [fagsystem, fagsakId]);

    React.useEffect(() => {
        if (fagsak?.status === RessursStatus.SUKSESS && behandlingId) {
            hentBehandling(fagsak.data, behandlingId);
        }
    }, [fagsak, behandlingId]);

    switch (fagsak?.status) {
        case RessursStatus.SUKSESS: {
            switch (behandling?.status) {
                case RessursStatus.SUKSESS:
                    return (
                        <>
                            <Personlinje bruker={fagsak.data.bruker} fagsak={fagsak.data} />

                            <FagsakContainerContent>
                                <BehandlingContainer
                                    fagsak={fagsak.data}
                                    behandling={behandling.data}
                                />
                            </FagsakContainerContent>
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
