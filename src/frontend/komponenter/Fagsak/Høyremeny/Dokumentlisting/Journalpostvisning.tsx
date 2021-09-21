import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Undertekst } from 'nav-frontend-typografi';

import { IJournalpost, Journalposttype } from '@navikt/familie-typer';

import { formatterDatoOgTid, hentDatoRegistrertSendt } from '../../../../utils';
import { DokumentIkon } from '../../../Felleskomponenter/Ikoner';
import Dokumentvisning from './Dokumentvisning';

const Journalpost = styled.div`
    display: flex;
    flex-direction: row;
    line-height: 1.5rem;
`;

const Dialog = styled.div`
    width: 3.5rem;
    min-width: 3.5rem;
    text-align: center;
    background-image: radial-gradient(
        1px 1px at center,
        ${navFarger.navGra40} 1px,
        transparent 1px,
        transparent 4px
    );
    background-size: 100% 5px;
`;

const Innhold = styled.div`
    margin-bottom: 1.5rem;
    width: fit-content;
`;

const typer: Record<Journalposttype, string> = {
    I: 'Innkommende',
    U: 'Utgående',
    N: 'Notat',
};

interface IProps {
    journalpost: IJournalpost;
}

const JournalpostVisning: React.FC<IProps> = ({ journalpost }) => {
    const datoRegistrertSendt = hentDatoRegistrertSendt(
        journalpost.relevanteDatoer,
        journalpost.journalposttype
    );
    return (
        <Journalpost>
            <Dialog>
                <DokumentIkon type={journalpost.journalposttype} />
            </Dialog>
            <Innhold>
                {journalpost.dokumenter?.map(dok => (
                    <Dokumentvisning
                        key={`${journalpost.journalpostId}_${dok.dokumentInfoId}`}
                        journalpost={journalpost}
                        dokument={dok}
                    />
                ))}
                <Undertekst>
                    {`${datoRegistrertSendt ? formatterDatoOgTid(datoRegistrertSendt) : '-'} | `}
                    {typer[journalpost.journalposttype]}
                </Undertekst>
            </Innhold>
        </Journalpost>
    );
};

export default JournalpostVisning;
