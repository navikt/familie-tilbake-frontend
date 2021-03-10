import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Normaltekst, Undertittel } from 'nav-frontend-typografi';

import {
    IBehandling,
    behandlingsstatuser,
    behandlingsresultater,
    Behandlingstype,
} from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import Informasjonsbolk from '../../Felleskomponenter/Informasjonsbolk/Informasjonsbolk';
import { ytelsetype } from '../../../kodeverk';
import { formatterDatostring } from '../../../utils';

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
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

const Behandlingskort: React.FC<IProps> = ({ fagsak, behandling }) => {
    const tittel =
        behandling.type === Behandlingstype.REVURDERING_TILBAKEKREVING
            ? 'Revurdering tilbakekreving'
            : 'Tilbakekreving';
    return (
        <Container>
            <StyledUndertittel>{tittel}</StyledUndertittel>
            <Normaltekst>{`Opprettet: ${
                behandling.opprettetDato ? formatterDatostring(behandling.opprettetDato) : ''
            }`}</Normaltekst>
            <StyledHr />
            <Informasjonsbolk
                informasjon={[
                    {
                        label: 'Ytelse',
                        tekst: ytelsetype[fagsak.ytelsestype],
                    },
                    {
                        label: 'Behandlingsstatus',
                        tekst: behandlingsstatuser[behandling.status],
                    },
                    {
                        label: 'Resultat',
                        tekst: behandling.resultatstype
                            ? behandlingsresultater[behandling.resultatstype]
                            : '-',
                    },
                ]}
            />
        </Container>
    );
};

export default Behandlingskort;
