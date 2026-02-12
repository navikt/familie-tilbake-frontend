import { Heading } from '@navikt/ds-react';
import * as React from 'react';

import { useDokumentlisting } from './DokumentlistingContext';
import { JournalpostVisning } from './Journalpostvisning';
import { RessursStatus } from '../../../../typer/ressurs';
import { hentDatoRegistrertSendt } from '../../../../utils';
import { DataLastIkkeSuksess } from '../../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { HenterData } from '../../../Felleskomponenter/Datalast/HenterData';

export const Dokumentlisting: React.FC = () => {
    return (
        <>
            <Heading size="small" level="2">
                Dokumenter
            </Heading>
            <DokumentInnhold />
        </>
    );
};

const DokumentInnhold: React.FC = () => {
    const { journalposter } = useDokumentlisting();

    if (journalposter?.status === RessursStatus.Henter) {
        return <HenterData størrelse="large" beskrivelse="Henting av dokumenter tar litt tid." />;
    }

    if (journalposter?.status !== RessursStatus.Suksess) {
        return <DataLastIkkeSuksess ressurser={[journalposter]} />;
    }

    const poster = journalposter.data;
    poster.sort((a, b) => {
        return (
            hentDatoRegistrertSendt(b.relevanteDatoer, b.journalposttype).getTime() -
            hentDatoRegistrertSendt(a.relevanteDatoer, b.journalposttype).getTime()
        );
    });

    return (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-stable">
            {poster.map(post => (
                <JournalpostVisning key={`jpId_${post.journalpostId}`} journalpost={post} />
            ))}
            {poster.length === 0 && <div>Ingen dokumenter på saken.</div>}
        </div>
    );
};
