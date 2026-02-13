import type { DokumentInfo, Journalpost } from '../../../../typer/journalføring';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { Link } from '@navikt/ds-react';
import * as React from 'react';

import { Journalposttype } from '../../../../typer/journalføring';
import { HentDokument } from '../HentDokument';

type Props = {
    journalpost: Journalpost;
    dokument: DokumentInfo;
};

export const Dokumentvisning: React.FC<Props> = ({ journalpost, dokument }) => {
    const [visDokument, settVisDokument] = React.useState<boolean>(false);

    return (
        <div>
            {journalpost.journalposttype === Journalposttype.N ? (
                <span>{dokument.tittel}</span>
            ) : (
                <>
                    <Link
                        href="#"
                        onClick={(e: React.MouseEvent) => {
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
