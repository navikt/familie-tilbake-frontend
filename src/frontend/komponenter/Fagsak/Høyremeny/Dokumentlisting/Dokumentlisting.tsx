import * as React from 'react';
import { styled } from 'styled-components';

import { useDokumentlisting } from './DokumentlistingContext';
import JournalpostVisning from './Journalpostvisning';
import { RessursStatus } from '../../../../typer/ressurs';
import { hentDatoRegistrertSendt } from '../../../../utils';
import DataLastIkkeSuksess from '../../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import HenterData from '../../../Felleskomponenter/Datalast/HenterData';

const StyledContainer = styled.div`
    margin-top: 10px;
`;

const Dokumentlisting: React.FC = () => {
    const { journalposter } = useDokumentlisting();

    switch (journalposter?.status) {
        case RessursStatus.SUKSESS: {
            const poster = journalposter.data;
            poster.sort((a, b) => {
                return (
                    hentDatoRegistrertSendt(b.relevanteDatoer, b.journalposttype).getTime() -
                    hentDatoRegistrertSendt(a.relevanteDatoer, b.journalposttype).getTime()
                );
            });
            return (
                <StyledContainer>
                    {poster.map(post => (
                        <JournalpostVisning key={`jpId_${post.journalpostId}`} journalpost={post} />
                    ))}
                    {poster.length === 0 && <div>Ingen dokumenter på saken.</div>}
                </StyledContainer>
            );
        }
        case RessursStatus.HENTER:
            return (
                <HenterData størrelse="large" beskrivelse="Henting av dokumenter tar litt tid." />
            );
        default:
            return <DataLastIkkeSuksess ressurser={[journalposter]} />;
    }
};

export default Dokumentlisting;
