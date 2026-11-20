import type { FC } from 'react';
import type { DokumentInfo, Journalpost } from '@/typer/journalføring';

import { FileTextIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, HStack, VStack } from '@navikt/ds-react';
import { useId } from 'react';

import { Journalposttype } from '@/typer/journalføring';
import { formatterDatoOgKlokkeslett } from '@/utils/dato';

import { useÅpneDokumentINyFane } from './useÅpneDokumentINyFane';

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
    const åpneDokumentINyFane = useÅpneDokumentINyFane();
    const tittel = dokument.tittel ?? 'Dokument uten tittel';
    const { dokumentInfoId } = dokument;
    const tittelId = useId();
    const metadataId = useId();
    const nyFaneId = useId();

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
                <BodyShort id={tittelId} as="span" weight="semibold" className="wrap-break-word">
                    {tittel}
                </BodyShort>
                <BodyShort id={metadataId} as="span" size="small" textColor="subtle">
                    {`${formatterDatoOgKlokkeslett(dato)} | ${journalposttyper[journalpost.journalposttype]}`}
                </BodyShort>
            </VStack>
        </HStack>
    );

    if (journalpost.journalposttype === Journalposttype.N || !dokumentInfoId) {
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
                aria-labelledby={`${tittelId} ${nyFaneId}`}
                aria-describedby={metadataId}
                onClick={(): void =>
                    åpneDokumentINyFane({
                        journalpostId: journalpost.journalpostId,
                        dokumentInfoId,
                    })
                }
                borderWidth="1"
                borderColor="neutral-subtle"
                borderRadius="12"
                padding="space-8"
                className="w-full cursor-pointer text-left hover:bg-ax-bg-neutral-moderate-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ax-border-focus"
            >
                {innhold}
                <span id={nyFaneId} className="sr-only">
                    (åpnes i ny fane)
                </span>
            </Box>
        </li>
    );
};
