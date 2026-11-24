import type { FC } from 'react';
import type { Hendelse, Rolle } from '@/generated-new';
import type { RolleTag } from '@/utils/rolle';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Detail, Process, Tag } from '@navikt/ds-react';
import { useState } from 'react';

import { fraIsoStringTilDatoOgKlokkeslett } from '@/utils/dato';
import { baseRolleTag } from '@/utils/rolle';

import { HistorikkDokument } from './HistorikkDokument';

type Props = {
    hendelser: Hendelse[];
};

type ValgtDokument = {
    journalpostId: string;
    dokumentId: string;
};

const rolleTag: Record<Rolle, RolleTag> = {
    ...baseRolleTag,
    VEDTAKSLØSNING: { label: 'Vedtaksløsning', dataColor: 'neutral' },
};

export const Hendelser: FC<Props> = ({ hendelser }: Props) => {
    const [valgtDokument, setValgtDokument] = useState<ValgtDokument | null>(null);

    if (hendelser.length === 0) {
        return (
            <BodyShort size="small" className="flex flex-1 justify-center items-center">
                Det finnes ingen historikk
            </BodyShort>
        );
    }

    const nyesteFørst = hendelser.toSorted((a, b) => b.opprettet.localeCompare(a.opprettet));

    return (
        /* Lagt inn issue på aksel-process__title-styling: https://github.com/navikt/aksel/issues/5558#issue-6469665498 */
        <>
            <Process aria-label="Historikk" className="[&_.aksel-process\_\_title]:text-ax-large">
                {nyesteFørst.map(hendelse => {
                    const {
                        JOURNALPOST_ID: journalpostId,
                        DOKUMENTINFO_ID: dokumentId,
                        ...ekstraInfo
                    } = hendelse.ekstraInfo;
                    return (
                        <Process.Event
                            key={`${hendelse.opprettet}-${hendelse.tittel}`}
                            title={hendelse.tittel}
                            timestamp={fraIsoStringTilDatoOgKlokkeslett(hendelse.opprettet)}
                            status="completed"
                            // bullet
                            /* 
                                1. mellomrom mellom detaljer og beskrivelse
                                2. se etter forskjellige typer som kan populere bullet
                                3. hva med uttalelsesfrist?
                                4. Se på pdf-biten, feil som vises etc.
                                5. Se historikk-feil som dukker opp
                            */
                        >
                            <Detail className="flex gap-2 items-center mb-2">
                                <Tag
                                    data-color={rolleTag[hendelse.rolle].dataColor}
                                    variant="moderate"
                                    size="small"
                                >
                                    {rolleTag[hendelse.rolle].label}
                                </Tag>
                                {hendelse.rolleIdent !== 'VL' &&
                                    hendelse.rolleIdent !== null &&
                                    hendelse.rolleIdent}
                            </Detail>
                            {hendelse.beskrivelse && (
                                <BodyShort size="small" className="whitespace-pre-line mb-2">
                                    {hendelse.beskrivelse}
                                </BodyShort>
                            )}
                            {Object.entries(ekstraInfo).map(([nøkkel, verdi]) => (
                                <BodyShort key={nøkkel} size="small">
                                    {nøkkel}: {verdi}
                                </BodyShort>
                            ))}
                            {journalpostId && dokumentId && (
                                <Button
                                    variant="tertiary"
                                    size="small"
                                    icon={<ExternalLinkIcon aria-hidden />}
                                    iconPosition="right"
                                    onClick={(): void =>
                                        setValgtDokument({ journalpostId, dokumentId })
                                    }
                                >
                                    Åpne dokument
                                    <span className="sr-only">: {hendelse.tittel}</span>
                                </Button>
                            )}
                        </Process.Event>
                    );
                })}
            </Process>
            {valgtDokument && (
                <HistorikkDokument
                    journalpostId={valgtDokument.journalpostId}
                    dokumentId={valgtDokument.dokumentId}
                    onClose={(): void => setValgtDokument(null)}
                />
            )}
        </>
    );
};
