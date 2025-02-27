import type { IDokumentInfo, IJournalpost } from '../../../../typer/journalføring';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { Link } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import HentDokument from './HentDokument';
import { Journalposttype } from '../../../../typer/journalføring';

const Dokument = styled.span`
    display: block;
`;

interface IProps {
    journalpost: IJournalpost;
    dokument: IDokumentInfo;
}

const Dokumentvisning: React.FC<IProps> = ({ journalpost, dokument }) => {
    const [visDokument, settVisDokument] = React.useState<boolean>(false);

    return (
        <Dokument>
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
                            journalpost={journalpost}
                            dokument={dokument}
                            onClose={() => {
                                settVisDokument(false);
                            }}
                        />
                    )}
                </>
            )}
        </Dokument>
    );
};

export default Dokumentvisning;
