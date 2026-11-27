import type { AkselColor } from '@navikt/ds-react/types/theme';
import type { FC } from 'react';
import type { DokumentInfo, Journalpost, JournalposttypeEnum } from '@/generated';

import { FileTextIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, HStack, Tag, VStack } from '@navikt/ds-react';
import { useId } from 'react';

import { formatterDatoOgKlokkeslett } from '@/utils/dato';

import { useÅpneDokumentINyFane } from './useÅpneDokumentINyFane';

type Props = {
    journalpost: Journalpost;
    dokument: DokumentInfo;
    dato: Date;
};

const journalposttyper: Record<JournalposttypeEnum, { tekst: string; farge: AkselColor }> = {
    I: { tekst: 'Innkommende', farge: 'info' },
    U: { tekst: 'Utgående', farge: 'meta-purple' },
    N: { tekst: 'Notat', farge: 'neutral' },
};

export const Dokumentvisning: FC<Props> = ({ journalpost, dokument, dato }: Props) => {
    const åpneDokumentINyFane = useÅpneDokumentINyFane();
    const tittel = dokument.tittel ?? 'Dokument uten tittel';
    const { dokumentInfoId } = dokument;
    const tittelId = useId();
    const metadataId = useId();
    const nyFaneId = useId();
    const journalposttype = journalposttyper[journalpost.journalposttype];

    const innhold = (
        <HStack as="span" gap="space-16" align="center" wrap={false}>
            <Box
                as="span"
                background="brand-blue-soft"
                borderRadius="4"
                className="flex size-11.5 shrink-0 items-center justify-center text-ax-text-brand-blue"
            >
                <FileTextIcon aria-hidden fontSize="1.5rem" />
            </Box>
            <VStack as="span" gap="space-2" className="min-w-0">
                <BodyShort
                    id={tittelId}
                    as="span"
                    size="small"
                    weight="semibold"
                    className="wrap-break-word"
                >
                    {tittel}
                </BodyShort>
                <HStack id={metadataId} as="span" gap="space-8" align="center">
                    <BodyShort
                        as="time"
                        dateTime={dato.toISOString()}
                        size="small"
                        textColor="subtle"
                    >
                        {formatterDatoOgKlokkeslett(dato)}
                    </BodyShort>
                    <Tag variant="moderate" size="xsmall" data-color={journalposttype.farge}>
                        {journalposttype.tekst}
                    </Tag>
                </HStack>
            </VStack>
        </HStack>
    );

    if (journalpost.journalposttype === 'N') {
        return (
            <Box
                as="li"
                borderWidth="1"
                borderColor="brand-blue-subtle"
                borderRadius="12"
                padding="space-8"
            >
                {innhold}
            </Box>
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
                borderColor="brand-blue-subtle"
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
