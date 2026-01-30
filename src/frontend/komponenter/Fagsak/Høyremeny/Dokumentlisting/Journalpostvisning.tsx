import type { Journalpost } from '../../../../typer/journalføring';

import { Detail } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import Dokumentvisning from './Dokumentvisning';
import { Journalposttype } from '../../../../typer/journalføring';
import { formatterDatoOgTid, hentDatoRegistrertSendt } from '../../../../utils';
import { DokumentIkon } from '../../../Felleskomponenter/Ikoner';

const Journalpost = styled.div`
    display: flex;
    flex-direction: row;
`;

const Dialog = styled.div`
    width: 3.5rem;
    min-width: 3.5rem;
    text-align: center;
    background-image: radial-gradient(
        1px 1px at center,
        var(--ax-border-neutral-strong) 1px,
        transparent 1px,
        transparent 4px
    );
    background-size: 100% 5px;
`;

const typer: Record<Journalposttype, string> = {
    [Journalposttype.I]: 'Innkommende',
    [Journalposttype.U]: 'Utgående',
    [Journalposttype.N]: 'Notat',
};

type Props = {
    journalpost: Journalpost;
};

const JournalpostVisning: React.FC<Props> = ({ journalpost }) => {
    const datoRegistrertSendt = hentDatoRegistrertSendt(
        journalpost.relevanteDatoer,
        journalpost.journalposttype
    );
    return (
        <Journalpost>
            <Dialog>
                <DokumentIkon type={journalpost.journalposttype} />
            </Dialog>
            <div className="mb-6">
                {journalpost.dokumenter?.map(dok => (
                    <Dokumentvisning
                        key={`${journalpost.journalpostId}_${dok.dokumentInfoId}`}
                        journalpost={journalpost}
                        dokument={dok}
                    />
                ))}
                <Detail>
                    {`${datoRegistrertSendt ? formatterDatoOgTid(datoRegistrertSendt) : '-'} | `}
                    {typer[journalpost.journalposttype]}
                </Detail>
            </div>
        </Journalpost>
    );
};

export default JournalpostVisning;
