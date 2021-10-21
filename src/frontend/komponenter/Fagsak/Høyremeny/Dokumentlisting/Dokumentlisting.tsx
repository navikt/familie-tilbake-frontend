import * as React from 'react';

import styled from 'styled-components';

import AlertStripe from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Normaltekst } from 'nav-frontend-typografi';

import { Journalstatus, RessursStatus } from '@navikt/familie-typer';

import { hentDatoRegistrertSendt } from '../../../../utils';
import { useDokumentlisting } from './DokumentlistingContext';
import JournalpostVisning from './Journalpostvisning';

const StyledContainer = styled.div`
    margin-top: 10px;
`;

const Dokumentlisting: React.FC = () => {
    const { journalposter } = useDokumentlisting();

    switch (journalposter?.status) {
        case RessursStatus.SUKSESS:
            const poster = journalposter.data;
            poster.sort((a, b) => {
                if (a.journalstatus !== Journalstatus.FERDIGSTILT) {
                    return 1;
                }
                if (b.journalstatus !== Journalstatus.FERDIGSTILT) {
                    return -1;
                }
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
        case RessursStatus.HENTER:
            return (
                <div>
                    <Normaltekst>Henting av dokumenter tar litt tid.</Normaltekst>
                    <NavFrontendSpinner type="L" />
                </div>
            );
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return <AlertStripe children={journalposter.frontendFeilmelding} type="feil" />;
        default:
            return <div />;
    }
};

export default Dokumentlisting;
