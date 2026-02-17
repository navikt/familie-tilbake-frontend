import type { Journalpost } from '../../../typer/journalføring';

import { Detail } from '@navikt/ds-react';
import * as React from 'react';

import { Dokumentvisning } from './Dokumentvisning';
import { Journalposttype } from '../../../typer/journalføring';
import { formatterDatoOgTid, hentDatoRegistrertSendt } from '../../../utils';
import { DokumentIkon } from '../../ikoner';

const typer: Record<Journalposttype, string> = {
    [Journalposttype.I]: 'Innkommende',
    [Journalposttype.U]: 'Utgående',
    [Journalposttype.N]: 'Notat',
};

type Props = {
    journalpost: Journalpost;
};

export const JournalpostVisning: React.FC<Props> = ({ journalpost }) => {
    const datoRegistrertSendt = hentDatoRegistrertSendt(
        journalpost.relevanteDatoer,
        journalpost.journalposttype
    );
    return (
        <div className="flex flex-row gap-2 mb-6">
            <DokumentIkon type={journalpost.journalposttype} />
            <div>
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
        </div>
    );
};
