import type { FC } from 'react';
import type { DokumentInfo, Journalpost } from '@/typer/journalføring';

import { FileTextIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, HStack, VStack } from '@navikt/ds-react';
import { useState } from 'react';

import { HentDokument } from '@/komponenter/sidebar/HentDokument';
import { Journalposttype } from '@/typer/journalføring';
import { formatterDatoOgKlokkeslett } from '@/utils/dato';

type Props = {
    journalpost: Journalpost;
    dokument: DokumentInfo;
    dato: Date;
};

const journalposttyper: Record<Journalposttype, string> = {
    [Journalposttype.I]: 'Innkommende',
    [Journalposttype.U]: 'Utgående',
    [Journalposttype.N]: 'Notat',
};

export const Dokumentvisning: FC<Props> = ({ journalpost, dokument, dato }: Props) => {
    const [visDokument, setVisDokument] = useState(false);
    const kanÅpnes = journalpost.journalposttype !== Journalposttype.N;

    const innhold = (
        <HStack as="span" gap="space-16" align="center" wrap={false}>
            <Box
                as="span"
                background="neutral-soft"
                borderRadius="4"
                className="flex size-11.5 shrink-0 items-center justify-center"
            >
                <FileTextIcon aria-hidden fontSize="1.5rem" />
            </Box>
            <VStack as="span" gap="space-2" className="min-w-0">
                <BodyShort as="span" weight="semibold" className="wrap-break-word">
                    {dokument.tittel ?? 'Dokument uten tittel'}
                </BodyShort>
                <BodyShort as="span" size="small" textColor="subtle">
                    {`${formatterDatoOgKlokkeslett(dato)} | ${journalposttyper[journalpost.journalposttype]}`}
                </BodyShort>
            </VStack>
        </HStack>
    );

    if (!kanÅpnes) {
        return (
            <li>
                <Box
                    borderWidth="1"
                    borderColor="neutral-subtle"
                    borderRadius="12"
                    padding="space-8"
                >
                    {innhold}
                </Box>
            </li>
        );
    }

    return (
        <li>
            <Box
                as="button"
                type="button"
                aria-haspopup="dialog"
                onClick={(): void => setVisDokument(true)}
                borderWidth="1"
                borderColor="neutral-subtle"
                borderRadius="12"
                padding="space-8"
                className="w-full cursor-pointer text-left hover:bg-ax-bg-neutral-moderate-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ax-border-focus"
            >
                {innhold}
            </Box>
            {visDokument && (
                <HentDokument
                    journalpostId={journalpost.journalpostId}
                    dokumentId={dokument.dokumentInfoId}
                    onClose={(): void => setVisDokument(false)}
                />
            )}
        </li>
    );
};
