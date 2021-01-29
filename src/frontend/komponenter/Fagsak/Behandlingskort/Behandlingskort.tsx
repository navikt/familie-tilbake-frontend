import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Normaltekst, Undertittel } from 'nav-frontend-typografi';

import {
    IBehandling,
    behandlingÅrsak,
    behandlingsstatuser,
    behandlingsresultater,
} from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import Informasjonsbolk from '../../Felleskomponenter/Informasjonsbolk/Informasjonsbolk';

interface IProps {
    fagsak: IFagsak;
    åpenBehandling: IBehandling;
}

const Container = styled.div`
    border: 1px solid ${navFarger.navGra40};
    border-left: 0.5rem solid ${navFarger.navGra40};
    border-radius: 0.25rem;
    padding: 0.5rem;
    margin: 0.5rem;
    border-left-color: ${navFarger.navGra40};
`;

const StyledUndertittel = styled(Undertittel)`
    font-size: 1rem;
    margin-bottom: 0.2rem;
`;

const StyledHr = styled.hr`
    border: none;
    border-bottom: 1px solid ${navFarger.navLysGra};
`;

const Behandlingskort: React.FC<IProps> = ({ åpenBehandling }) => {
    const tittel = 'Tilbakekreving';
    return (
        <Container>
            <StyledUndertittel>{tittel}</StyledUndertittel>
            <Normaltekst>{behandlingÅrsak[åpenBehandling.årsak]}</Normaltekst>
            <StyledHr />
            <Informasjonsbolk
                informasjon={[
                    {
                        label: 'Behandlingsstatus',
                        tekst: behandlingsstatuser[åpenBehandling.status],
                    },
                    {
                        label: 'Resultat',
                        tekst: behandlingsresultater[åpenBehandling.resultat],
                    },
                ]}
            />
        </Container>
    );
};

export default Behandlingskort;
