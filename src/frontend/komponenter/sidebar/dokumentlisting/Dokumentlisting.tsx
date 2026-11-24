import type { FC } from 'react';

import { BodyShort, Heading, VStack } from '@navikt/ds-react';

import { DataLastIkkeSuksess } from '@/komponenter/datalast/DataLastIkkeSuksess';
import { RessursStatus } from '@/typer/ressurs';
import { hentDatoRegistrertSendt } from '@/utils';

import { useDokumentlisting } from './DokumentlistingContext';
import { DokumentlistingSkeleton } from './DokumentlistingSkeleton';
import { Dokumentvisning } from './Dokumentvisning';

export const Dokumentlisting: FC = () => {
    const { journalposter } = useDokumentlisting();

    if (!journalposter || journalposter.status === RessursStatus.Henter) {
        return <DokumentlistingSkeleton />;
    }

    if (journalposter.status !== RessursStatus.Suksess) {
        return <DataLastIkkeSuksess ressurser={[journalposter]} />;
    }

    const dokumenter = journalposter.data
        .map(journalpost => ({
            journalpost,
            dato: hentDatoRegistrertSendt(journalpost.relevanteDatoer, journalpost.journalposttype),
        }))
        .sort((a, b) => b.dato.getTime() - a.dato.getTime())
        .flatMap(({ journalpost, dato }) =>
            (journalpost.dokumenter ?? []).map(dokument => ({ journalpost, dokument, dato }))
        );

    return (
        <VStack gap="space-16" className="min-h-full">
            <Heading level="2" size="small">
                Dokumenter
            </Heading>
            {dokumenter.length == 0 ? (
                <BodyShort className="flex flex-1 items-center justify-center">
                    Det finnes ingen dokumenter
                </BodyShort>
            ) : (
                <VStack as="ul" gap="space-16">
                    {dokumenter.map(({ journalpost, dokument, dato }) => (
                        <Dokumentvisning
                            key={`${journalpost.journalpostId}_${dokument.dokumentInfoId}`}
                            journalpost={journalpost}
                            dokument={dokument}
                            dato={dato}
                        />
                    ))}
                </VStack>
            )}
        </VStack>
    );
};
