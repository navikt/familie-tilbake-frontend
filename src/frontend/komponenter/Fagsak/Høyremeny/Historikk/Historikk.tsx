import * as React from 'react';

import { parseISO } from 'date-fns';
import styled from 'styled-components';

import AlertStripe from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Normaltekst } from 'nav-frontend-typografi';

import { RessursStatus } from '@navikt/familie-typer';

import { useHistorikk } from './HistorikkContext';
import HistorikkInnslag from './HistorikkInnslag';

const StyledContainer = styled.div`
    margin-top: 10px;
`;

const Historikk: React.FC = () => {
    const { historikkInnslag } = useHistorikk();

    switch (historikkInnslag?.status) {
        case RessursStatus.SUKSESS:
            const innslag = historikkInnslag.data;
            innslag.sort(
                (a, b) => parseISO(b.opprettetTid).getTime() - parseISO(a.opprettetTid).getTime()
            );
            return (
                <StyledContainer>
                    {innslag.map((hi, index) => (
                        <HistorikkInnslag key={`${hi.tittel}_${index}`} innslag={hi} />
                    ))}
                </StyledContainer>
            );
        case RessursStatus.HENTER:
            return (
                <div>
                    <Normaltekst>Henting av logg tar litt tid.</Normaltekst>
                    <NavFrontendSpinner type="L" />
                </div>
            );
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return <AlertStripe children={historikkInnslag.frontendFeilmelding} type="feil" />;
        default:
            return <div />;
    }
};

export default Historikk;
