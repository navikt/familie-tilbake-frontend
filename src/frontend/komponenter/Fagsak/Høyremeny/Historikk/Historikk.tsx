import * as React from 'react';

import { parseISO } from 'date-fns';
import { styled } from 'styled-components';

import { useHistorikk } from './HistorikkContext';
import HistorikkInnslag from './HistorikkInnslag';
import DataLastIkkeSuksess from '../../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { RessursStatus } from '../../../../typer/ressurs';

const StyledContainer = styled.div`
    margin-top: 10px;
`;

const Historikk: React.FC = () => {
    const { historikkInnslag } = useHistorikk();

    if (historikkInnslag?.status === RessursStatus.SUKSESS) {
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
    } else {
        return (
            <DataLastIkkeSuksess
                ressurser={[historikkInnslag]}
                henteBeskrivelse="Henter historikk"
                spinnerStørrelse={'large'}
            />
        );
    }
};

export default Historikk;
