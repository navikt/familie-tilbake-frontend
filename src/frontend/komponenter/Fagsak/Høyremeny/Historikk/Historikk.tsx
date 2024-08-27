import * as React from 'react';

import { parseISO } from 'date-fns';
import { styled } from 'styled-components';

import { Alert } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { useHistorikk } from './HistorikkContext';
import HistorikkInnslag from './HistorikkInnslag';
import HenterData from '../../../Felleskomponenter/HenterData/HenterData';

const StyledContainer = styled.div`
    margin-top: 10px;
`;

const Historikk: React.FC = () => {
    const { historikkInnslag } = useHistorikk();

    switch (historikkInnslag?.status) {
        case RessursStatus.SUKSESS: {
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
        }
        case RessursStatus.HENTER:
            return <HenterData størrelse={'large'} beskrivelse="Henter historikk" />;
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return <Alert variant="error">{historikkInnslag.frontendFeilmelding}</Alert>;
        default:
            return <Alert variant="warning">Kunne ikke hente data om historikk</Alert>;
    }
};

export default Historikk;
