import type { FC, MouseEvent } from 'react';
import type { DokumentInfo, Journalpost } from '~/typer/journalføring';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { Link } from '@navikt/ds-react';
import { useState } from 'react';

import { HentDokument } from '~/komponenter/sidebar/HentDokument';
import { Journalposttype } from '~/typer/journalføring';

type Props = {
    journalpost: Journalpost;
    dokument: DokumentInfo;
};

export const Dokumentvisning: FC<Props> = ({ journalpost, dokument }) => {
    const [visDokument, settVisDokument] = useState<boolean>(false);

    return (
        <div>
            {journalpost.journalposttype === Journalposttype.N ? (
                <span>{dokument.tittel}</span>
            ) : (
                <>
                    <Link
                        href="#"
                        onClick={(e: MouseEvent) => {
                            e.preventDefault();
                            settVisDokument(true);
                        }}
                    >
                        {dokument.tittel}
                        <ExternalLinkIcon aria-label={`Åpne ${dokument.tittel}`} />
                    </Link>
                    {visDokument && (
                        <HentDokument
                            journalpostId={journalpost.journalpostId}
                            dokumentId={dokument.dokumentInfoId}
                            onClose={() => settVisDokument(false)}
                        />
                    )}
                </>
            )}
        </div>
    );
};
